var request = require('request-promise'),
    config = require('../../config'),
    _ = require('util'),
    _debug = require('debug'),
    key, token;
var debug = _debug('app:controller:yunbook');
module.exports = {
    online:function* () {
        yield this.render('yunbook/online',{
            key:this.cookies.get('key'),
            token:this.cookies.get('token'),
            api:config.url.outside.api,
            upload:config.url.outside.upload
        });
    },
    clazz: function*() {
        var id = parseInt(this.params.id, 10),
            url, lid = parseInt(this.params.lid,10), admin = false,isLogin=false,
            cybid = 0;
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (!id || !lid) {
            this.set('refresh', '3,/');
            this.body = '缺少参数，即将跳转...';
            return;
        }
        yield request({
            uri:`${config.url.inside.api}user/valid`,
            qs:{
                key:key,
                token:token
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                isLogin=true;
            }   
        }).catch(function(err){
            console.error(`user/valid:${err.message}`);
        })
        if(!isLogin){
            this.set('refresh','3,/login?redirect='+encodeURIComponent(this.url));
            this.body = '请先登录，即将跳转...';
            return;
        }
        var yunbook, clazzYunbook, msg,isStudent=false;
        //判断是否为课程学生
        yield request({
            uri:`${config.url.inside.api}lessonuser/get`,
            qs:{
                uid:key,
                lid:lid
            },gzip:true,json:true
        }).then(function(data){
            //如果不是课程学生则加入
            if(data.code === 0 && data.get.id != undefined){
                isStudent = true;
            }
            //TODO:如果接口调用失败则再次调用接口，三次调用失败后跳转其他页面
        })
        //如果不是课程学生则先判断是否主讲老师
        if(!isStudent){
            yield request({
                uri: config.url.inside.api + 'lesson/get',
                qs: {
                    lid: lid
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0 && data.get.uid !==
                    undefined) {
                    admin = data.get.uid == key;
                }
            }, function(err) {
                console.error(err.message);
            });
            //如果不是主讲教师，判断是不是讲师
            if (admin) {
                yield request({
                    uri: `${config.url.inside.api}lessonadmin/list?lid=${lid}`,
                    gzip: true,
                    json: true
                }).then(function(data) {
                    if (data.code === 0) {
                        data.list.forEach(function(item, index) {
                            if (item.uid == key) {
                                admin = true;
                                return;
                            }
                        })
                    }
                });
            }
        }
        //如果不是学生也不是老师，则自动报名参加课程
        if(!isStudent && !admin){
            yield request({
                    uri:`${config.url.inside.api}lessonuser/add`,
                    qs:{
                        lid:lid,
                        uid:key,
                        key:key,
                        token:token
                    },gzip:true,json:true
                }).then(function(data){
                    if(data.code === 0){
                        isStudent = true;
                    }else{
                        console.error(`lessonuser/add :${data.msg}`);
                    }
                })
        }
        yield request({
            uri: config.url.inside.api + 'classroomfile/get',
            qs: {
                cfid: id,
                key: key,
                token: token
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                clazzYunbook = data.get;
            }else{
                msg = data.msg;
            }
        }).catch(function(err) {
            msg = err.message;
            console.error(err.message);
        });
        if (clazzYunbook === undefined) {
            if(msg === '账号验证出错'){
                this.set('refresh','3,/login?redirect='+encodeURIComponent(this.url));
                this.body = '账号验证出错,请重新登录，即将跳转...';
                return;
            }else if(msg === '请先报名该课程'){
                //如果不是学生则自动加入课程,不应该出现
                
            }
        }
        //获取原始云板书
        yield request({
            uri: config.url.inside.api + 'userfile/get',
            qs: {
                fid: clazzYunbook.fid
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                yunbook = data.get;
            }
        }).catch(function(err) {
            debug(err.message);
        });
        if (yunbook === undefined) {
            this.set('refresh', '3,/');
            this.body = '获取云板书失败，请稍后再试，即将跳转...';
            return;
        }
        
        var classRoomYunbookList = [],
            label = '';
        if(admin) {
            label = clazzYunbook.label;
            yield request({
                uri: config.url.inside.api +
                    'classroomyunbook/list',
                qs: {
                    cfid: id,
                    key: key,
                    token: token
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0 && data.list.length > 0) {
                    classRoomYunbookList = data.list;
                }
            }, function(err) {
                console.error(err.message);
            });
        }else {
            if(clazzYunbook.label!=''){
                classRoomYunbookList.push(clazzYunbook.label);
            }
            yield request({
                uri: config.url.inside.api +
                    'classroomyunbook/get',
                qs: {
                    cfid: id,
                    key: key,
                    token: token,
                    uid: key
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0 && data.get.id !==
                    undefined) {
                    cybid = data.get.id;
                    label = data.get.label;
                }
            }).catch(function(err) {
                console.error(err.message);
            });
        }
        yield this.render('yunbook/clazz', {
            yunbook: yunbook,
            key: key,
            token: token,
            label: label,
            cfid: id,
            cybid: cybid,
            admin: admin,
            api: config.url.outside.api,
            classRoomYunbookList:encodeURIComponent(JSON.stringify(classRoomYunbookList))
        });
    },
    leaflet: function*() {
        var id = this.params.id,
            editable = false;
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        id = parseInt(id, 10);
        if (!id) {
            this.set('refresh', '3,/yunbook');
            this.body = '缺少参数，即将跳转...';
            return;
        }
        var yunbook;
        yield request({
            uri: config.url.inside.api + 'userFile/get',
            qs: {
                fid: id
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                yunbook = data.get;
            } else {
                debug(data.msg);
            }
        }).catch(function(err) {
            debug(err.message);
        });
        if (yunbook.fid === undefined) {
            this.body = '云板书不存在！';
            this.set('refresh', '3,/yunbook');
            return;
        }
        if (key == yunbook.uid) {
            editable = true;
        }
        yield this.render('yunbook/leaflet', {
            yunbook: yunbook,
            key: key,
            token: token,
            api: config.url.outside.api,
            editable: editable
        });
    },
    index: function*() {
        key = this.cookies.get('key');

        yield this.render('yunbook/index', {
            title: "云板书",
            logo: "云板书"
        });
    },
    add: function*() {
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === "undefined") {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield this.render('yunbook/add', {
            title: "新建云板书",
            logo: "云板书",
            config: {
                url: config.url.outside
            },
            key: key,
            token: token
        });
    },
    me: function*() {
        var yunBookList = [];
        key = this.cookies.get('key');
        if (typeof key === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        var count = 0;
        yield request({
            uri: config.url.inside.api + '/userFile/List/',
            qs: {
                limit: 9,
                ofs: 1,
                uid: key,
                type: 3
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                yunBookList = data.list;
            }
        }).catch(function(err) {
            debug(err.message);
        });
        yield request({
            uri: config.url.inside.api + '/userFile/info',
            qs: {
                uid: key,
                type: 3
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                count = data.info.count;
            }
        }).catch(function(err) {
            debug(err.message);
        })
        if (count > 0) {
            count = Math.ceil(count / 9);
        }
        yield this.render('yunbook/me', {
            title: "我的云板书",
            logo: "云板书",
            yunbooks: yunBookList,
            key: key,
            api: config.url.outside.api,
            count: count
        });
    },
};

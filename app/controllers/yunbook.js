var request = require('request-promise'),
    config = require('../../config'),
    _ = require('util'),
    _debug = require('debug'),
    key, token;
var debug = _debug('app:controller:yunbook');
function detectMobileBrowser(user_agent){
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(user_agent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(user_agent.substr(0,4))
}
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
            console.log(new Date(),`user/valid:${err.message}`);
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
                console.log(err.message);
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
                        console.log(`lessonuser/add :${data.msg}`);
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
            console.log(err.message);
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
                console.log(new Date(),'classroomyunbook/list',`cfid=${id}`,err.message);
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
                console.log(err.message);
            });
        }

        yield this.render('yunbook/clazz', {
            isMobile:detectMobileBrowser(this.request.get('user-agent').toLowerCase()),
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
            isMobile:detectMobileBrowser(this.request.get('user-agent').toLowerCase()),
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

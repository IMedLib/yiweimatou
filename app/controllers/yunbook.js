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
            editable = false,
            url, lid, admin = false,
            cybid = 0;
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (!id) {
            this.set('refresh', '3,/yunbook');
            this.body = '缺少参数，即将跳转...';
            return;
        }
        var yunbook, clazzYunbook, msg;
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
            debug(err.message);
        });
        if (clazzYunbook === undefined) {
            if(msg === '账号验证出错'){
                this.set('refresh','3,/login');
                this.body = '账号验证出错,请重新登录，即将跳转...';
                return;
            }
            this.set('refresh', '3,/');
            this.body = msg+',获取课堂云板书失败，请稍后再试，即将跳转...';
            return;
        }
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
            this.set('refresh', '3,/yunbook');
            this.body = '获取云板书失败，请稍后再试，即将跳转...';
            return;
        }
        //先判断是否主讲老师
        yield request({
            uri: config.url.inside.api + 'classroom/get',
            qs: {
                cid: clazzYunbook.cid,
                key: key,
                token: token
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0 && data.get.lid !== undefined) {
                lid = data.get.lid;
            }
        }, function(err) {
            debug(err.message);
        });
        if (lid !== undefined) {
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
                    editable = data.get.uid == key;
                    if (editable) {
                        admin = true;
                        url = config.url.outside.api +
                            'classroomfile/put';
                    }
                }
            }, function(err) {
                debug(err.message);
            });
        }
        //如果不是主讲教师，判断是不是讲师
        if (!editable && lid !== undefined) {
            yield request({
                uri: `${config.url.inside.api}lessonadmin/list?lid=${lid}`,
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0) {
                    data.list.forEach(function(item, index) {
                        debug(itemt.uid)
                        if (item.uid == key) {
                            editable = true;
                            admin = true;
                            return;
                        }
                    })
                }
            });
        }
        var classRoomYunbookList = [],
            label = '';
        //判断是否是课程学生
        if (!editable && lid !== undefined) {
            yield request({
                uri: `${config.url.inside.api}lessonuser/get?uid=${key}`,
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0 && data.get.id !==
                    undefined) {
                    editable = true;
                }
            }).catch(function(err) {
                debug(err.message);
            });
        } else {
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
                debug(err.message);
            });
        }

        if (!admin && editable) {
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
                debug(err.message);
                editable = false;
            });
        }
        // debug(JSON.stringify(classRoomYunbookList));
        yield this.render('yunbook/clazz', {
            yunbook: yunbook,
            key: key,
            token: token,
            label: label,
            editable: editable,
            cfid: id,
            cybid: cybid,
            admin: admin,
            api: config.url.outside.api,
            classRoomYunbookList: encodeURIComponent(JSON.stringify(
                classRoomYunbookList))
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

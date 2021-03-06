/**
 * Created by zhangruofan on 2016/1/5.
 */
var request = require('request-promise'),
    config = require('../../config'),
    _debug = require('debug'),
    // co = require('co'), 
    // forEach = require('co-foreach'),
    key, token;
const debug = _debug('app:controller:lesson');
module.exports = {
    index: function*() {
        var oid = this.query.oid,
            lessons = [],
            count = 0;
        oid = oid === undefined ? '' : oid;
        yield request({
            uri: config.url.inside.api + 'lesson/info',
            qs: {
                oid: oid
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                count = data.info.count;
            } else {
                console.log(data.msg);
            }
        }, function(err) {
            console.log(err.message);
        });
        if (count > 0) {
            count = Math.ceil(count / 9);
            yield request({
                uri: config.url.inside.api + 'lesson/list',
                qs: {
                    limit: 9,
                    ofs: 1,
                    oid: oid
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0) {
                    lessons = data.list;
                } else {
                    console.log('/lesson/list', data);
                }
            }).catch(function(err) {
                console.log('/lesson/list', err.message);
            });
        }
        yield this.render('lesson/index', {
            title: '课程列表',
            logo: '云课程',
            lessons: lessons,
            domain: config.url.outside.domain,
            api:config.url.outside.api,
            count: count
        })
    },
    edit: function*() {
        var lid = this.params.id,
            lesson, admin = 0;
        if (typeof lid === 'undefined') {
            this.body = '缺少参数，请勿修改URL,即将跳转';
            this.set('refresh', '3,/lesson');
            return;
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.inside.api + 'lesson/get/',
            qs: {
                lid: lid
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                lesson = data.get;
            } else {
                console.log('lesson/get/', data);
            }
        }).catch(function(err) {
            console.log('lesson/get/', err.message);
        });
        //如果不是主讲教师，继续查是不是讲师
        if (key !== lesson.uid.toString()) {
            yield request({
                uri: config.url.inside.api +
                    '/lessonadmin/list/',
                qs: {
                    lid: lid
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0) {
                    data.list.forEach(function(item, index) {
                        if (item.uid == key) {
                            admin = 1;
                            return;
                        }
                    })
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            admin = 2;
        }
        if (admin === 0) {
            this.redirect('/lesson')
        }
        yield this.render('lesson/edit', {
            title: '课程修改',
            logo: '云课程',
            key: key,
            token: token,
            lesson: lesson,
            admin: admin,
            config: {
                url: config.url.outside
            }
        });
    },
    me: function*() {
        var lessons=[], count;
        key = this.cookies.get('key');
        if (typeof key === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.inside.api + 'lessonuser/info',
            qs: {
                uid: key
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                count = Math.ceil(data.info.count / 9);
            } else {
                console.log('lesson/info', data);
            }
        }).catch(function(err) {
            console.log('lesson/info', err.message);
        });
        var lids=[];
        if(count > 0){
            yield request({
                uri: config.url.inside.api + '/lessonuser/list',
                qs: {
                    uid: key,
                    limit: 9,
                    ofs: 1
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0) {
                    return lids = data.list
                } else {
                    console.log('/lessonuser/list', data.msg);
                    Promise.reject(data.msg);
                }
            }).catch(function(err) {
                console.log('/lessonuser/list', err.message);
            });
        }
        for(index in lids){
          yield  request({
                uri:config.url.inside.api+'/lesson/get',
                qs:{
                    lid:lids[index].lid
                },gzip:true,json:true
                }).then(function(data){
                    if(data.code === 0){
                        lessons.push(data.get)
                    }
                })
        }
        yield this.render('lesson/me', {
            lessons: lessons,
            title: '我的课程',
            logo: '云课程',
            key: key,
            count: count,
            config:config
        });
    },
    admin: function*() {
        var lessons = [],
            lids;
        key = this.cookies.get('key');
        if (typeof key === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.inside.api + 'lessonadmin/list',
            qs: {
                uid: key
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                lids = data.list;
            } else {
                console.log('lessonAdmin/list', data);
            }
        }).catch(function(err) {
            console.log('lessonAdmin/list', err.message);
        });
        if (lids !== undefined && lids.length > 0) {
            for (index in lids) {
                yield request({
                    uri: config.url.inside.api +
                        '/lesson/get',
                    qs: {
                        lid: lids[index].lid
                    },
                    gzip: true,
                    json: true
                }).then(function(data) {
                    if (data.code === 0) {
                        lessons.push(data.get);
                    } else {
                        debug('/lesson/get', data);
                    }
                }).catch(function(err) {
                    debug('/lesson/get', err.message);
                });
            }
        }
        yield this.render('lesson/admin', {
            title: '讲师课程',
            logo: "云课程",
            lessons: lessons,
            key: key,
            count: Math.ceil(lids.length / 9)
        });
    },
    show: function*() {
        var lid = this.params.id,
            admin = 0,
            lesson, group, clazzes,isLogin = true;
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        //获取课堂列表
        yield request({
            uri: config.url.inside.api + 'classroom/list/',
            qs: {
                ofs: 1,
                limit: 50,
                lid: lid,
                key: key,
                token: token
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                clazzes = data.list;
            } else if(data.msg === '账号验证出错'){
                isLogin = false;
            }
        }).catch(function(err) {
            console.log(new Date(),err.message);
        });
        //如果账户验证出错则引导登录
        if(!isLogin){
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        //获取课程详情
        yield request({
            uri: config.url.inside.api + '/Lesson/Get/',
            qs: {
                lid: lid
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                lesson = data.get;
            } else {
                console.log(new Date(),'/Lesson/Get/' + data.msg);
            }
        }).catch(function(err) {
            console.log(new Date(),'lesson/get/',err.message);
        });
        if (typeof lesson === 'undefined') {
            this.body = '课程获取失败，先去其他课程看看吧';
            this.set('refresh', '3,/lesson');
            return;
        }
        //如果不是主讲教师，继续查是不是讲师
        if (lesson.uid !== undefined && key !== lesson.uid.toString()) {
            yield request({
                uri: config.url.inside.api +
                    '/Lessonadmin/List/',
                qs: {
                    lid: lid
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0) {
                    if (data.list.indexOf(key) > -1) {
                        admin = 1;
                    }
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        } else {
            admin = 2;
        }
        if (admin === 0) {
            yield request({
                uri: config.url.inside.api + 'lessonUser/Get/',
                qs: {
                    uid: key,
                    lid: lid
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0) {
                    if (typeof data.get.id != 'undefined') {
                        admin = -1
                    }
                }
            }).catch(function(err) {
                debug('lessonUser/Get/', err.message);
            });
        }
        //获取机构信息
        yield request({
            uri: config.url.inside.api + 'organ/get',
            qs: {
                oid: lesson.oid
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                group = data.get;
            } else {
                console.log('organ/get', data.msg);
            }
        }).catch(function(err) {
            console.log('organ/get', err.message);
        });
        yield this.render('lesson/show', {
            title: lesson.title,
            logo: '云课程',
            admin: admin, //2主讲教师，1教师，0普通用户 ,-1课程学生
            lesson: lesson,
            key: key,
            token: token,
            config: {
                url: config.url.outside
            },
            clazzes: clazzes,
            group: group
        });
    },
    add: function*() {
        var oid = this.params.id,
            group;
        if (typeof oid === 'undefined') {
            this.body = '缺少参数，请不要随意修改URL！';
            this.set('refresh', '3,/lesson');
            return;
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            debug(`key=${key};token=${token}`);
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.inside.api + 'organ/get/',
            qs: {
                oid: oid
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                group = data.get;
            } else {
                debug('organ/get/', data);
            }
        }).catch(function(err) {
            debug('organ/get/', err.message);
        });
        yield this.render('lesson/add', {
            title: '添加课程',
            logo: '云课程加',
            group: group,
            config: {
                url: config.url.outside
            },
            key: key,
            token: token
        });
    }
};

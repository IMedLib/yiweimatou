/**
 * Created by zhangruofan on 2016/1/5.
 */
var request = require('request-promise'),
    config = require('../../config'),
    _debug = require('debug'),
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
                debug(data.msg);
            }
        }, function(err) {
            debug(err.message);
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
                    debug('/lesson/list', data);
                }
            }).catch(function(err) {
                debug('/lesson/list', err.message);
            });
        }
        yield this.render('lesson/index', {
            title: '课程列表',
            logo: '云课程',
            lessons: lessons,
            domain: config.url.outside.domain,
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
                console.error('lesson/get/', data);
            }
        }).catch(function(err) {
            console.error('lesson/get/', err.message);
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
                console.error(err.message);
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
        var lessons, count;
        key = this.cookies.get('key');
        if (typeof key === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.inside.api + 'lesson/info',
            qs: {
                uid: key
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                count = Math.ceil(data.info.count / 9);
            } else {
                console.error('lesson/info', data);
            }
        }).catch(function(err) {
            console.error('lesson/info', err.message);
        });
        yield request({
            uri: config.url.inside.api + '/lesson/list',
            qs: {
                uid: key,
                limit: 9,
                ofs: 1
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                lessons = data.list;
            } else {
                console.error('/lesson/list', data);
            }
        }).catch(function(err) {
            console.error('/lesson/list', err.message);
        });
        yield this.render('lesson/me', {
            lessons: lessons,
            title: '主讲课程',
            logo: '云课程',
            key: key,
            count: count
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
                debug('lessonAdmin/list', data);
            }
        }).catch(function(err) {
            debug('lessonAdmin/list', err.message);
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
            lesson, group, clazzes;
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            debug(`key=${key};token=${token}`);
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
            } else {
                debug(`classroom/list:${data.msg}`);
            }
        }).catch(function(err) {
            debug(err.message);
        });
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
                debug('/Lesson/Get/' + data.msg);
            }
        }).catch(function(err) {
            debug(err.message);
        });
        if (typeof lesson === 'undefined') {
            this.body = '课程获取失败，先去其他课程看看吧';
            this.set('refresh', '3,/lesson');
            return;
        }
        //如果不是主讲教师，继续查是不是讲师
        if (lesson !== undefined && key !== lesson.uid.toString()) {
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
                debug(err.message);
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
                debug('organ/get', data.msg);
            }
        }).catch(function(err) {
            debug('organ/get', err.message);
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

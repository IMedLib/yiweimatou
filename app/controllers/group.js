'use strict';
var request = require('request-promise'),
    config = require('../../config'),
    _debug = require('debug'),
    key, token;
const debug = _debug('app:controller:group');
module.exports = {
    index: function*() {
        var groups;
        yield request({
            uri: config.url.inside.api + 'organ/list/',
            qs: {
                ofs: 1,
                limit: 9
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                groups = data.list;
            } else if(data.msg != ''){
                console.log(new Date(),'organ/list/', data);
            }
        }).catch(function(err) {
            console.log(new Date(),'/organ/list/', err.message);
        });
        var count = 0;
        yield request({
            uri: config.url.inside.api + 'organ/info',
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                count = data.info.count;
            }
        });
        if (count > 0) {
            count = Math.ceil(count / 9);
        }
        yield this.render('group/index', {
            title: '机构列表',
            logo: '机构号',
            groups: groups,
            count: count,
            api: config.url.outside.api
        });
    },
    show: function*() {
        var oid = this.params.id,
            group, admin = false,
            lessons;
        if(!Number.isInteger(oid)){
            this.redirect('/group');
        }
        yield request({
            uri: config.url.inside.api + "Organ/get",
            gzip: true,
            json: true,
            qs: {
                oid: oid
            }
        }).then(function(data) {
            if (data.code === 0) {
                group = data.get;
            } else {
                console.log(new Date().toLocaleString(),"Organ/get", data);
            }
        }).catch(function(err) {
            console.log(new Date().toLocaleString(),"Organ/get", err.message);
        });
        if (typeof group === 'undefined' || group === '{}') {
            this.redirect('/group');
        }
        yield request({
            uri: config.url.inside.api + '/lesson/list',
            qs: {
                limit: 3,
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
        key = this.cookies.get('key');
        if (typeof key !== 'undefined' && key === group.uid.toString()) {
            admin = true;
        }
        yield this.render('group/show', {
            title: group.title,
            logo: '机构号',
            group: group,
            domain: config.url.outside.domain,
            admin: admin,
            key: key,
            lessons: lessons
        });
    },
    me: function*() {
        key = this.cookies.get('key');
        if (typeof key === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        var groups;
        yield request({
            uri: config.url.inside.api + "/organ/list/",
            gzip: true,
            json: true,
            qs: {
                uid: key
            }
        }).then(function(data) {
            if (data.code === 0) {
                groups = data.list;
            }
        }).catch(function(err) {
            debug(err.message);
        });
        var count = 0;
        yield request({
            uri: config.url.inside.api + 'organ/info',
            qs: {
                uid: key
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                count = data.info.count;
            }
        }).catch(function(err) {
            debug(err.message);
        });
        if (count > 0) {
            count = Math.ceil(count / 9);
        }
        yield this.render('group/me', {
            title: '我管理的机构',
            groups: groups,
            logo: "机构号",
            key: key,
            count: count,
            api: config.url.outside.api
        });
    },
    edit: function*() {
        const id = this.params.id;
        const key = this.cookies.get('key');
        if(Number.isInteger(id)){
            this.redirect('/group');
        }
        if(parseInt(key,10) >= 10){
            this.redirect('/group');
        }
        var group;
        yield request({
            uri: config.url.inside.api + "Organ/get",
            gzip: true,
            json: true,
            qs: {
                oid: oid
            }
        }).then(function(data) {
            if (data.code === 0) {
                group = data.get;
            } else {
                console.log(new Date().toLocaleString(),"Organ/get", data);
            }
        }).catch(function(err) {
            console.log(new Date().toLocaleString(),"Organ/get", err.message);
        });
        if (typeof group === 'undefined' || group.oid === undefined) {
            this.redirect('/group');
        }
        yield this.render('group/edit', {
            title: "机构管理",
            logo: '机构号',
            group:group
        });
    },
    add: function*() {
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            this.set('refresh',
                `3,/login?redirect=${encodeURIComponent(this.url)}`
            );
            this.body = '请先登录，即将跳转...';
        }
        if (key >= 10) {
            this.redirect('/index');
        }
        yield this.render('group/add', {
            title: '新增机构',
            logo: '机构号',
            config: {
                url: config.url.outside
            },
            key: key,
            token: token
        })
    }
};

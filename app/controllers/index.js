var config = require('../../config'),_debug = require('debug'),
    request = require('request-promise');
var debug = _debug('app:control:index');
module.exports = {
    index: function*() {
        var lessons, groups;
        yield request({
            uri: config.url.inside.api + '/lesson/list',
            qs: {
                limit: 6,
                ofs: 1
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                lessons = data.list;
            }
        }).catch(function(err) {
            console.log('/lesson/list', err.message);
        });
        yield request({
            uri: config.url.inside.api + '/Organ/list',
            qs: {
                limit: 6,
                ofs: 1
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                groups = data.list;
            }
        }).catch(function(err) {
            console.log('/group/list', err.message);
        });
        yield this.render('index', {
            title: "首页",
            logo: "首页",
            lessons: lessons,
            groups: groups
        });
    },
    login: function*() {
        yield this.render('login', {
            account: config.url.outside.api,
            expire: config.cookie.expire
        });
    },
    register: function*() {
        yield this.render('register', {
            account: config.url.outside.api,
            expire: config.cookie.expire
        });
    }
};

/**
 * Created by zhangruofan on 2015/12/31.
 */
var request = require('request-promise'),
    config = require('../../configs/main'),
    key, token;

module.exports = {
    index: function *() {
        key = this.cookies.get('key');
        yield this.render('yunbook/index', {
            title: "云板书",
            logo: "云板书"
        });
    },
    show: function *() {
        var yid = this.query.yid,
            yunbook, lat, lng;
        if (typeof yid === 'undefined') {
            this.redirect('/yunbook');
        }
        yield request({
            uri: config.url.api + '/Useryunbook/Get/',
            qs: {
                yid: yid
            },
            gzip: true,
            json: true
        }).then(function (data) {
            if (data.code == 0 && data.get !== {}) {
                yunbook = data.get;
            }
        }).catch(function (err) {
            console.error(err.message);
        });
        if (typeof yunbook !== 'undefined') {
            yield request({
                uri: config.url.upload + 'PixelLngLat',
                qs: {
                    pixelX: parseFloat(yunbook.width / 2),
                    pixelY: parseFloat(yunbook.height / 2),
                    zoom: 3
                },
                gzip: true,
                json: true
            }).then(function (data) {
                lat = data.lat;
                lng = data.lng;
            }).catch(function (err) {
                console.error(err.message);
            });
        }
        yield this.render('yunbook/show', {
            title: '云板书显示',
            logo: "云板书",
            yunbook: yunbook,
            lat: lat,
            lng: lng
        });
    },
    add: function *() {
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === "undefined") {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield this.render('yunbook/add', {
            title: "新建云板书",
            logo: "云板书",
            config: config,
            key: key,
            token: token
        });
    },
    me: function *() {
        var yunBookList = [];
        key = this.cookies.get('key');
        if (typeof key === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.api + '/Useryunbook/List/',
            qs: {
                limit: 8,
                offset: 1,
                uid: key
            },
            gzip: true,
            json: true
        }).then(function (data) {
            if (data.code === 0) {
                yunBookList = data.list;
            }
        }).catch(function (err) {
            console.error(err.message);
        });
        yield this.render('yunbook/me', {
            title: "我的云板书",
            logo: "云板书",
            yunbooks: yunBookList
        });
    }
};

/**
 * Created by zhangruofan on 2016/1/5.
 */
var request = require('request-promise'),
    config = require('../../config'),
    key, token;
module.exports = {
    edit: function*() {
        var cid = this.params.id,
            clazz, lesson, yunbook;
        if (typeof cid === 'undefined') {
            this.redirect('/clazz');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.inside.api + 'Classroom/Get/',
            qs: {
                cid: cid,
                key: key,
                token: token
            },
            gzip: true,
            json: true
        }).then(function(data) {
            if (data.code === 0) {
                clazz = data.get;
            } else {
                console.log(new Date(),'Classroom/Get/',`cid=${cid}`, data);
            }
        }).catch(function(err) {
            console.log(new Date(),'Classroom/Get/', err.message);
        });
        if (typeof clazz === 'undefined' || clazz === '{}') {
            this.redirect('/lesson');
        } else {
            yield request({
                uri: config.url.inside.api + 'lesson/get',
                qs: {
                    lid: clazz.lid
                },
                gzip: true,
                json: true
            }).then(function(data) {
                if (data.code === 0) {
                    lesson = data.get;
                } else {
                    console.log(new Date(),'lesson/get',`lid=${lid}`, data);
                }
            }).catch(function(err) {
                console.log(new Date(),'lesson/get', err.message);
            });
        }
        yield this.render('clazz/edit', {
            key: key,
            token: token,
            clazz: clazz,
            lesson: lesson,
            title: clazz.names,
            logo: '云课堂',
            config: {
                url: config.url.outside
            }
        })
    }
};

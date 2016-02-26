var request = require('request-promise'),
    config = require('../../configs/index'),
    _ = require('util'),
    _debug = require('debug'),
    key, token;

var debug = _debug('app:controller:yunbook');
module.exports = {
    leaflet:function *(){
        var id = this.params.id;
        id = parseInt(id,10);
        if(!id){
            this.set('refresh','3,/lesson');
            this.body = '缺少参数，即将跳转...';
            return;
        }
        var yunbook;
        yield request({
            uri:config.url.inside.api+'userYunbook/get',
            qs:{
                yid:id
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                yunbook = data.get;
            }else{
                debug(data.msg);
            }
        }).catch(function(err){
            debug(err.message);
        });
        if(yunbook.yid === undefined){
            this.body = '云板书不存在！';
            return;
        }
        yield this.render('yunbook/leaflet',{
            width:yunbook.width,
            height:yunbook.height,
            url:yunbook.uri,
            maxZoom:yunbook.zoomnum,
            title:yunbook.title
        });
    },
    index: function *() {
        key = this.cookies.get('key');
        yield this.render('yunbook/index', {
            title: "云板书",
            logo: "云板书"
        });
    },
    edit: function *() {
        var yid = this.query.yid, id = this.query.id
            , yunbook, admin = false, mapData, lat, lng, lessonId, url;
        if (typeof yid === 'undefined' && typeof id === 'undefined') {
            this.redirect('/index');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === "undefined") {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        if (yid) {
            url = config.url.inside.api + 'userYunbook/put';
            yield request({
                uri: config.url.inside.api + 'userYunbook/get',
                qs: {
                    yid: yid
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0) {
                    yunbook = data.get;
                    mapData = yunbook.remark;
                } else {
                    console.error('userYunbook/get', data);
                }
            }).catch(function (err) {
                console.error('userYunbook/get', err.message);
            });
            if (typeof yunbook === 'undefined' || key !== yunbook.uid.toString()) {
                this.redirect('/index');
            } else {
                admin = true;
            }
        } else {
            url = config.url.outside.api + 'yunbook/put';
            yield request({
                uri: config.url.inside.api + 'yunbook/get',
                qs: {
                    id: id
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0) {
                    yid = data.get.yid;
                    mapData = data.get.remark;
                    lessonId = data.get.lid;
                } else {
                    console.error('yunbook/get', data);
                }
            }).catch(function (err) {
                console.error('yunbook/get', err.message);
            });
            yield request({
                uri: config.url.inside.api + 'userYunbook/get',
                qs: {
                    yid: yid
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0) {
                    yunbook = data.get;
                } else {
                    console.error('userYunbook/get', data);
                }
            }).catch(function (err) {
                console.error('userYunbook/get', err.message);
            });
        }
        if (typeof id !== 'undefined' && typeof lessonId !== 'undefined') {
            yield request({
                uri: config.url.inside.api + 'lesson/get',
                qs: {
                    lid: lessonId
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0) {
                    if (data.get.uid.toString() === key) {
                        admin = true;
                    }
                } else {
                    console.error('lesson/get', data);
                }
            }).catch(function (err) {
                console.error('lesson/get', err.message);
            });
        } else if (admin === false && yunbook.uid.toString() === key) {
            admin = true;
        }
        //判断是否课程讲师
        if (typeof id !== 'undefined' && typeof lessonId !== 'undefined' && admin === false) {
            yield request({
                uri: config.url.inside.api + 'lessonAdmin/list',
                qs: {
                    lid: lessonId
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0) {
                    if (data.list.indexOf(key) > -1) {
                        admin = true;
                    }
                } else {
                    console.error('lessonAdmin/list', data);
                }
            }).catch(function (err) {
                console.error('lessonAdmin/list', err.message);
            })
        }
        if (!admin) {
            this.redirect('/index');
        }
        if (typeof yunbook !== 'undefined') {
            yield request({
                uri: config.url.inside.upload + 'PixelLngLat',
                qs: {
                    pixelX: parseFloat(yunbook.width / 2),
                    pixelY: parseFloat(yunbook.height / 2),
                    zoom: yunbook.zoomnum
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
        yield this.render('yunbook/edit', {
            yunbook: yunbook,
            admin: admin,
            title: '云板书编辑',
            logo: '云板书',
            lat: lat,
            lng: lng,
            key: key,
            token: token,
            id: id,
            mapData: mapData,
            url: url
        })
    },
    clazzShow: function*() {
        var id = this.query.id, yunbook, yid = 0, cid = 0, lid = 0, admin = false,
            uid = 0, lat, lng, tmapData, smapData, users = [], count = 0;
        if (typeof id === 'undefined') {
            this.redirect('/index');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        yield request({
            uri: config.url.inside.api + 'yunbook/get',
            qs: {
                id: id
            }, gzip: true, json: true
        }).then(function (data) {
            if (data.code === 0) {
                yid = data.get.yid;
                cid = data.get.cid;
                lid = data.get.lid;
                tmapData = data.get.remark;
            }
        }).catch(function (err) {
            console.log('yunbook/get', err.message);
        });
        if (yid === 0 || cid === 0 || lid === 0) {
            this.redirect('/index');
        }
        //判断是否是老师
        yield request({
            uri: config.url.inside.api + 'lesson/get',
            qs: {
                lid: lid
            }, gzip: true, json: true
        }).then(function (data) {
            if (data.code === 0) {
                if (data.get.uid.toString() === key) {
                    admin = true;
                }
            }
        });
        if (!admin) {
            yield request({
                uri: config.url.inside.api + 'lessonAdmin/get',
                qs: {
                    uid: key,
                    lid: lid
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0 && data.get.id != undefined) {
                    admin = true;
                }
            }).catch(function (err) {
                console.log('lessonAdmin/get', err.message);
            });
        }
        if (admin) {
            var list;
            yield request({
                uri: config.url.inside.api + 'lessonUserYunbook/info',
                qs: {
                    cid: cid,
                    key: key,
                    token: encodeURIComponent(token)
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0) {
                    count = data.info.Count;
                }
            }).catch(function (err) {
                console.log('lessonUserYunbook/info', err.message);
            });
            if (count > 0) {
                yield request({
                    uri: config.url.inside.api + 'lessonUserYunbook/list',
                    qs: {
                        cid: cid,
                        key: key,
                        token: encodeURIComponent(token),
                        offset: 1,
                        limit: 9
                    }, gzip: true, json: true
                }).then(function (data) {
                    if (data.code === 0) {
                        list = data.list;
                    }
                }).catch(function (err) {
                    console.log('lessonUserYunbook/list', err.message);
                });
                list.forEach(function (element) {
                    request({
                        uri: config.url.inside.api + 'userInfo/get',
                        qs: {
                            uid: element.uid
                        }, gzip: true, json: true
                    }).then(function (data) {
                        if (data.code === 0) {
                            element.cname = data.get.cname;
                            users.push(element);
                        }
                    }).catch(function (err) {
                        console.log('userInfo/get', err.message);
                    });
                });
            }
        }
        //是否课程学生
        if (!admin) {
            yield request({
                uri: config.url.inside.api + 'lessonUser/get',
                qs: {
                    lid: lid,
                    uid: key
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0 && data.get.id != undefined) {
                    uid = key;
                }
            }).catch(function (err) {
                console.log('lessonUser/get', err.message);
            });
            if (uid != 0) {
                yield request({
                    uri: config.url.inside.api + 'lessonUserYunbook/get',
                    qs: {
                        uid: key,
                        lid: lid,
                        key: key,
                        token: encodeURIComponent(token)
                    }, gzip: true, json: true
                }).then(function (data) {
                    if (data.code === 0) {
                        smapData = data.get.remark;
                    }
                }).catch(function (err) {
                    console.log('lessonUserYunbook/get', err.message);
                });
            }
        }
        //既不是老师也不是学生
        if (!admin && uid === 0) {
            this.redirect('/index');
        }
        yield request({
            uri: config.url.inside.api + 'userYunbook/get',
            qs: {
                yid: yid
            }, gzip: true, json: true
        }).then(function (data) {
            if (data.code === 0) {
                yunbook = data.get;
            }
        }).catch(function (err) {
            console.log('userYunbook/get', err.message);
        });
        if (yunbook === undefined) {
            this.redirect('/index');
        } else {
            yield request({
                uri: config.url.inside.upload + 'PixelLngLat',
                qs: {
                    pixelX: parseFloat(yunbook.width / 2),
                    pixelY: parseFloat(yunbook.height / 2),
                    zoom: yunbook.zoomnum
                },
                gzip: true,
                json: true
            }).then(function (data) {
                lat = data.lat;
                lng = data.lng;
            }).catch(function (err) {
                console.log(err.message);
            });
        }
        yield this.render('yunbook/clazzshow', {
            admin: admin,
            logo: '云板书',
            yunbook: yunbook,
            lat: lat,
            lng: lng,
            smapData: smapData,
            tmapData: tmapData,
            users: users,
            cid: cid,
            api: config.url.outside.api,
            uid: uid,
            key: key,
            token: token,
            count: count
        });
    },
    show: function *() {
        var yid = this.query.yid,
            yunbook, lat, lng;
        if (typeof yid === 'undefined') {
            this.redirect('/yunbook');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        yield request({
            uri: config.url.inside.api + '/userYunbook/Get/',
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
                uri: config.url.inside.upload + 'PixelLngLat',
                qs: {
                    pixelX: parseFloat(yunbook.width / 2),
                    pixelY: parseFloat(yunbook.height / 2),
                    zoom: yunbook.zoomnum
                },
                gzip: true,
                json: true
            }).then(function (data) {
                lat = data.lat;
                lng = data.lng;
            }).catch(function (err) {
                console.error(err.message);
            });
        } else {
            this.redirct('/index');
        }
        yield this.render('yunbook/show', {
            title: yunbook.title,
            logo: "云板书",
            yunbook: yunbook,
            lat: lat,
            lng: lng,
            key: key,
            token: token
        });
    },
    showFull: function *() {
        var yid = this.query.yid, id = this.query.id,
            yunbook, lat, lng,tmapData,smapData,cid=0;
        if (typeof yid === 'undefined') {
            this.redirect('/yunbook');
        }
        yield request({
            uri: config.url.inside.api + '/userYunbook/Get/',
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
        key = this.cookies.get('key');
        if(typeof id !== 'undefined'){
            yield request({
                uri:config.url.inside.api+'yunbook/get',
                qs:{
                    id:id
                },gzip:true,json:true
            }).then(function(data){
                if(data.code === 0){
                    tmapData = data.get.remark;
                    if(typeof key !== 'undefined'){
                        cid = data.get.cid;
                    }
                }
            }).catch(function(err){
                console.log('yunbook/get',err.message);
            })
        }
        if(cid>0){
            yield request({
                uri:config.url.inside.api+'lessonUserYunbook/get',
                qs:{
                    uid:key,
                    cid:cid
                },json:true,gzip:true
            }).then(function(data){
                if(data.code === 0){
                    smapData = data.get.remark;
                }
            }).catch(function(err){
               console.log('lessonUserYunbook/get',err.message);
            });
        }
        if (typeof yunbook !== 'undefined') {
            yield request({
                uri: config.url.inside.upload + 'PixelLngLat',
                qs: {
                    pixelX: parseFloat(yunbook.width / 2),
                    pixelY: parseFloat(yunbook.height / 2),
                    zoom: yunbook.zoomnum
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
        yield this.render('yunbook/showfull', {
            title: yunbook.title,
            yunbook: yunbook,
            lat: lat,
            lng: lng,
            tmapData:tmapData,
            smapData:smapData
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
            config: {
                url: config.url.outside
            },
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
            uri: config.url.inside.api + '/Useryunbook/List/',
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
            yunbooks: yunBookList,
            key: key
        });
    },
    stuEdit: function *() {
        var id = this.query.id, lid = 0, yid = 0, cid = 0, admin = false
            , url, tmapData = [], mapData = [], lat, lng, yunbook, xid;
        if (typeof id === 'undefined') {
            this.redirect('/index');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === "undefined") {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.inside.api + 'yunbook/get',
            qs: {
                id: id
            }, gzip: true, json: true
        }).then(function (data) {
            if (data.code === 0) {
                lid = data.get.lid;
                yid = data.get.yid;
                tmapData = data.get.remark;
                cid = data.get.cid;
            }
        }).catch(function (err) {
            console.log('yunbook/get', err.message);
        });
        if (yid === 0 || lid === 0) {
            this.redirect('/index');
        }
        yield request({
            uri: config.url.inside.api + 'lessonUser/Get/',
            qs: {
                lid: lid,
                uid: key
            }, gzip: true, json: true
        }).then(function (data) {
            if (data.code === 0 && data.get.uid !== 'undefined') {
                admin = true;
            }
        }).catch(function (err) {
            console.log('lessonUser/get', err.message);
        });
        if (!admin) {
            this.redirect('/index');
        }
        yield request({
            uri: config.url.inside.api + 'userYunbook/get',
            qs: {
                yid: yid
            }, gzip: true, json: true
        }).then(function (data) {
            if (data.code === 0) {
                yunbook = data.get;
            }
        }).catch(function (err) {
            console.log('userYunbook/get', err.message);
        });
        if (typeof yunbook !== 'undefined') {
            yield request({
                uri: config.url.inside.upload + 'PixelLngLat',
                qs: {
                    pixelX: parseFloat(yunbook.width / 2),
                    pixelY: parseFloat(yunbook.height / 2),
                    zoom: yunbook.zoomnum
                },
                gzip: true,
                json: true
            }).then(function (data) {
                lat = data.lat;
                lng = data.lng;
            }).catch(function (err) {
                console.log(err.message);
            });
        }
        yield request({
            uri: config.url.inside.api + 'lessonUserYunbook/Get/',
            qs: {
                uid: key,
                cid: cid,
                key: key,
                token: encodeURIComponent(token)
            }, gzip: true, json: true
        }).then(function (data) {
            if (data.code === 0) {
                if (data.get.id !== 'undefined') {
                    mapData = data.get.remark;
                    url = config.url.outside.api + 'lessonUserYunbook/put';
                    xid = data.get.id;
                }
            }
        }).catch(function (err) {
            console.log(err.message);
        });
        if (typeof xid === 'undefined') {
            url = config.url.outside.api + 'lessonUserYunbook/add';
        }
        yield this.render('yunbook/stuEdit', {
            yunbook: yunbook,
            title: '添加标注',
            logo: '云板书',
            lat: lat,
            lng: lng,
            key: key,
            token: token,
            xid: xid,
            id:id,
            mapData: mapData,
            tmapData: tmapData,
            url: url,
            cid: cid,
            yid: yid
        })
    },
    online:function*(){
        yield this.render('yunbook/online',{
            title:'在线云板书',
            logo:'云板书'
        });
    }

};

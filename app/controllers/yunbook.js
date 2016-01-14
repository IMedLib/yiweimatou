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
    edit:function *(){
        var yid = this.query.yid,id = this.query.id
            ,yunbook,admin=false,mapData,lat,lng,lessonId,url;
        if (typeof yid === 'undefined' && typeof id === 'undefined') {
            this.redirect('/index');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === "undefined") {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        if(yid){
            url = config.url.api+'userYunbook/put';
            yield request({
               uri:config.url.api+'userYunbook/get',
                qs:{
                    yid:yid
                },gzip:true,json:true
            }).then(function(data){
                if(data.code === 0){
                    yunbook = data.get;
                    mapData = yunbook.remark;
                }else{
                    console.error('userYunbook/get',data);
                }
            }).catch(function(err){
                console.error('userYunbook/get',err.message);
            });
        }else{
            url = config.url.api+'yunbook/put';
            yield request({
                uri:config.url.api+'yunbook/get',
                qs:{
                    id:id
                },gzip:true,json:true
            }).then(function(data){
                if(data.code === 0){
                    yid = data.get.yid;
                    mapData = data.get.remark;
                    lessonId = data.get.lid;
                }else{
                    console.error('yunbook/get',data);
                }
            }).catch(function(err){
                console.error('yunbook/get',err.message);
            }).then(function(){
               request({
                   uri:config.url.api+'userYunbook/get',
                   qs:{
                       yid:yid
                   },gzip:true,json:true
               }).then(function(data){
                   if(data.code === 0){
                       yunbook = data.get;
                   }else {
                       console.error('userYunbook/get',data);
                   }
               }).catch(function(err){
                   console.error('userYunbook/get',err.message);
               });
            });
        }
        if (typeof yunbook !== 'undefined') {
            yield request({
                uri: config.url.upload + 'PixelLngLat',
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

        if(typeof id !== 'undefined' && typeof lessonId !== 'undefined'){
            yield request({
               uri:config.url.api+'lesson/get',
                qs:{
                    lid:lessonId
                },gzip:true,json:true
            }).then(function(data){
                if(data.code === 0){
                    if (data.get.uid.toString() === key){
                        admin = true;
                    }
                }else{
                    console.error('lesson/get',data);
                }
            }).catch(function(err){
                console.error('lesson/get',err.message);
            });
        }else if(admin === false &&　yunbook.uid.toString() === key){
            admin = true;
        }
        //判断是否课程讲师
        if (typeof id !== 'undefined' && typeof lessonId !== 'undefined' &&admin === false){
            yield request({
                uri:config.url.api+'lessonAdmin/list',
                qs:{
                    lid:lessonId
                },gzip:true,json:true
            }).then(function(data){
                if(data.code === 0){
                    if(data.list.indexOf(key)>-1){
                        admin = true;
                    }
                }else{
                    console.error('lessonAdmin/list',data);
                }
            }).catch(function(err){
                console.error('lessonAdmin/list',err.message);
            })
        }
        yield this.render('yunbook/edit',{
            yunbook:yunbook,
            admin:admin,
            title:'云板书编辑',
            logo:'云板书',
            lat: lat,
            lng: lng,
            key:key,
            token:token,
            id:id,
            mapData:mapData,
            url:url
        })
    },
    show: function *() {
        var yid = this.query.yid,
            yunbook, lat, lng;
        if (typeof yid === 'undefined') {
            this.redirect('/yunbook');
        }
        key =  this.cookies.get('key');
        token = this.cookies.get('token');
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
        yield this.render('yunbook/show', {
            title: yunbook.title,
            logo: "云板书",
            yunbook: yunbook,
            lat: lat,
            lng: lng,
            key:key,
            token:token
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

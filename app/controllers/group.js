/**
 * Created by zhangruofan on 2016/1/4.
 */
var request = require('request-promise'),
    config = require('../../configs/index'),
    key, token;

module.exports = {
    index: function *() {
        var groups;
        yield request({
            uri: config.url.inside.api + '/Organ/List/',
            qs: {
                offset: 1,
                limit: 9
            },
            gzip: true,
            json: true
        }).then(function (data) {
            if (data.code === 0) {
                groups = data.list;
            } else {
                console.error('/Organ/List/',data);
            }
        }).catch(function (err) {
            console.error('/Organ/List/',err.message);
        });
        yield this.render('group/index', {
            title: '机构列表',
            logo: '机构号',
            groups: groups,
            domain:config.url.outside.domain
        });
    },
    show: function*() {
        var oid = this.query.oid,group,admin=false;
        if (typeof oid === 'undefined'){
            this.redirect('/group');
        }
        yield request({
            uri: config.url.inside.api + "Organ/get",
            gzip: true,
            json: true,
            qs: {
                oid: oid
            }
        }).then(function (data) {
            if (data.code === 0) {
                group = data.get;
            }else{
                console.error("Organ/get",data);
            }
        }).catch(function (err) {
            console.error("Organ/get",err.message);
        });
        if (typeof group === 'undefined' || group === '{}'){
            this.redirect('/group');
        }
        key = this.cookies.get('key');
        if(typeof key !== 'undefined' && key === group.uid.toString()){
                admin=true;
        }
        yield this.render('group/show', {
            title: group.title,
            logo: '机构号',
            group:group,
            domain:config.url.outside.domain,
            admin:admin,
            key:key
        });
    },
    me: function *() {
        key = this.cookies.get('key');
        if (typeof key === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        var gourpList;
        yield request({
            uri: config.url.inside.api + "/Organ/List/",
            gzip: true,
            json: true,
            qs: {
                uid: key
            }
        }).then(function (data) {
            if (data.code === 0) {
                gourpList = data.list;
            }
        }).catch(function (err) {
            console.error(err.message);
        });
        yield this.render('group/me', {
            title: '我管理的机构',
            groupList: gourpList,
            logo: "机构号",
            key:key
        });
    },
    edit: function*() {
        yield this.render('group/manage', {
            title: "机构管理",
            logo: '机构号'
        });
    },
    add:function*(){
        var count = 0 ,users;
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        if(key > 10){
            this.redirect('/index');
        }
        yield request({
           uri:config.url.inside.api+"userInfo/info",
            gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                count=Math.ceil(data.info.Count/9);
            }else{
                console.error("userInfo/info",data);
            }
        }).catch(function(err){
            console.error("userInfo/info",err.message);
        });
        yield request({
            uri:config.url.inside.api+"userInfo/list",
            qs:{
                limit:9,
                offset:1
            },gzip:true,json:true
        }).then(function(data){
            if(data.code ===0 ){
                users = data.list;
            }else{
                console.error("userInfo/list",data);
            }
        }).catch(function(err){
           console.error("userInfo/list",err.message);
        });
        yield this.render('group/add',{
            title:'新增机构',
            logo:'机构号',
            count:count,
            users:users,
            config:{
                url:config.url.outside
            },
            key:key,
            token:token
        })
    }
};
/**
 * Created by zhangruofan on 2016/1/6.
 */
var config = require('../../config'),
    request = require('request-promise'),
    key,token;
module.exports = {
    me: function *() {
        var files;
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if(typeof key === 'undefined' || typeof token === 'undefined'){
            this.redirect('/login?redirect='+encodeURIComponent(this.url));
        }
        yield request({
            uri:config.url.inside.api+'userfile/list',
            qs:{
                uid:key
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                files = data.list;
            }else{
                console.error('userfile/get',data);
            }
        }).catch(function(err){
           console.error('userfile/get',err.message);
        });
        yield this.render('file/me',{
            title:'我的文件',
            logo:'资源加',
            files:files,
            config:{
                url:config.url.outside
            },
            key:key
        });
    },
    add: function *() {
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if(typeof key === 'undefined' || typeof token === 'undefined'){
            this.redirect('/login?redirect='+encodeURIComponent(this.url));
        }
        yield this.render('file/add',{
            title:'新增文件',
            logo:'资源加',
            key:key,
            token:token,
            config:{
                url:config.url.outside
            }
        })
    }
};

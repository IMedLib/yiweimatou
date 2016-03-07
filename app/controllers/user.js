'use strict';
var config = require('../../config'),
    request = require('request-promise'),
    _debug = require('debug');

const debug = _debug('app:controller:user');
module.exports={
    home:function *(){
        let key = this.cookies.get('key'),user=[];
        if(typeof key === 'undefined'){
          this.set('refresh',`3,/login?redirect=${encodeURIComponent(this.url)}`);
          this.body = '请先登录，即将跳转...';
          return;
        }
        yield request({
            uri:config.url.inside.api+'user/get',
            qs:{
                uid:key
            },gzip:true,json:true,timeout:10000
        }).then(function(data){
            if (data.code === 0){
                user =  data.get;
            }
        }).catch(function(err){
            debug('user/get',err.message);
        });
        yield this.render('user/home',{
            title:"我的主页",
            logo : "我的主页",
            user:user
        });
    },
    setting:function *(){
        let key = this.cookies.get('key'),
            token = this.cookies.get('token'),
            user;
        if(typeof key === 'undefined' || typeof token === 'undefined'){
          this.set('refresh',`3,/login?redirect=${encodeURIComponent(this.url)}`);
          this.body = '请先登录，即将跳转...';
          return;
        }
        yield request({
            uri:config.url.inside.api+'user/get',
            qs:{
                uid:key,
                key:key,
                token:token
            },gzip:true,json:true
        }).then(function(data){
            if (data.code === 0){
                user =  data.get;
            }else{
              debug(data);
            }
        }).catch(function(err){
            debug('user/get',err.message);
        });
        yield this.render('user/setting',{
            title:'个人设置',
            logo:'我的主页',
            user:user,
            key:key,
            token:token,
            config:{
                url:config.url.outside
            }
        })
    }
};

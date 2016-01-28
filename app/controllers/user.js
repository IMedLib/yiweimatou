/**
 * Created by zhangruofan on 2015/12/28.
 */
'use strict';
var config = require('../../configs/index'),
    request = require('request-promise');
module.exports={
    home:function *(){
        yield this.render('user/home',{
            title:"我的主页",
            logo : "我的主页"
        });
    },
    setting:function *(){
        let key = this.cookies.get('key'),
            token = this.cookies.get('token'),
            user;
        if(typeof key === 'undefined' || typeof token === 'undefined'){
            this.redirect('/login?redirect='+encodeURIComponent(this.url));
        }
        yield request({
            uri:config.url.inside.api+'userInfo/get',
            qs:{
                uid:key
            },gzip:true,json:true
        }).then(function(data){
            if (data.code === 0){
                user =  data.get;
            }
        }).catch(function(err){
            console.log('userInfo/get',err.message);
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
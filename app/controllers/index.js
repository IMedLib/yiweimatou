/**
 * Created by zhangruofan on 2015/12/28.
 */
var config=require('../../configs/main.js');
module.exports={
    index:function *(){
        yield this.render('index',{
            title:"首页",
            logo:"首页"
        });
    },
    login:function *(){
        yield this.render('login',{
            account:config.url.account,
            expire:config.cookie.expire
        });
    },
    register:function *(){
        yield this.render('register',{
            account:config.url.account,
            expire:config.cookie.expire
        });
    }
};
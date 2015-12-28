/**
 * Created by zhangruofan on 2015/12/28.
 */
var config=require('../../configs/main.js');
module.exports={
    index:function *(){
        yield this.render('index');
    },
    login:function *(){
        yield this.render('login',{
            account:config.url.account
        });
    },
    register:function *(){
        yield this.render('register',{
            account:config.url.account
        });
    }
};
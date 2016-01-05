/**
 * Created by zhangruofan on 2016/1/5.
 */
var request = require('request-promise'),
    config = require('../../configs/main'),
    key, token;
module.exports={
    edit:function *(){
        var cid = this.query.cid,clazz;
        if (typeof cid === 'undefined'){
            this.redirect('/clazz');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined'){
            this.redirect('/login?redirect='+encodeURIComponent(this.url));
        }
        yield request({
           uri:config.url.api+'Classroom/Get/',
            qs:{
                cid:cid
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                clazz = data.get;
            }else{
                console.error('Classroom/Get/',data);
            }
        }).catch(function(err){
            console.error('Classroom/Get/',err.message);
        });
        yield this.render('clazz/edit',{
            key:key,
            token:token,
            clazz:clazz
        })
    }
};
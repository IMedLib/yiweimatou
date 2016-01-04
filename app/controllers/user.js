/**
 * Created by zhangruofan on 2015/12/28.
 */
module.exports={
    home:function *(){
        yield this.render('user/home',{
            title:"我的主页",
            logo : "我的主页"
        });
    }
};
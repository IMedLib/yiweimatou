/**
 * Created by zhangruofan on 2016/1/5.
 */
var request = require('request-promise'),
    config = require('../../configs/index'),
    key, token;
module.exports = {
    index:function *(){
        var oid = this.query.oid,lessons;
        oid = oid === 'undefined'?'':oid;
        yield request({
            uri:config.url.api+'/lesson/list',
            qs:{
                limit:9,
                offset:1,
                oid:oid
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                lessons = data.list;
            }else{
                console.error('/lesson/list',data);
            }
        }).catch(function(err){
            console.error('/lesson/list',err.message);
        });
        yield this.render('lesson/index',{
            title:'课程列表',
            logo:'云课程',
            lessons:lessons,
            domain:config.url.domain
        })
    },
    edit: function *() {
        var lid = this.query.lid, lesson,admin=0;
        if (typeof lid === 'undefined') {
            this.redirect('/lesson');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.api + 'Lesson/Get/',
            qs: {
                lid: lid
            }, gzip: true, json: true
        }).then(function (data) {
            if (data.code === 0) {
                lesson = data.get;
            } else {
                console.error('Lesson/Get/', data);
            }
        }).catch(function (err) {
            console.error('Lesson/Get/', err.message);
        });
        //如果不是主讲教师，继续查是不是讲师
        if (key !== lesson.uid.toString()) {
            yield request({
                uri: config.url.api + '/Lessonadmin/List/',
                qs: {
                    lid: lid,
                    state: 4//已审核
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0 && data.list.indexOf(key) > -1) {
                    admin = 1;
                }
            }).catch(function (err) {
                console.error(err.message);
            });
        } else {
            admin = 2;
        }
        if(admin === 0){
            this.redirect('/lesson')
        }
        yield this.render('lesson/edit', {
            title:'课程修改',
            logo:'云课程',
            key: key,
            token: token,
            lesson: lesson,
            admin:admin,
            config:config
        });
    },
    me:function *(){
        var lessons;
        key = this.cookies.get('key');
        if (typeof key === 'undefined'){
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri:config.url.api+'/lesson/list',
            qs:{
                uid:key
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                lessons=data.list;
            }else{
                console.error('/lesson/list',data);
            }
        }).catch(function(err){
            console.error('/lesson/list',err.message);
        });
        yield this.render('lesson/me',{
            lessons:lessons,
            title:'主讲课程',
            logo:'云课程',
            key:key
        });
    },
    admin:function *(){
      var lessons;
        key = this.cookies.get('key');
        if (typeof key === 'undefined'){
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.api + 'lessonAdmin/list',
            qs: {
                uid: key
            }, gzip: true, json: true
        }).then(function(data){
            if(data.code === 0){

            }
        });
        yield this.render('lesson/admin',{
           title:'讲师课程',
            logo:"云课程",
            lessons:lessons,
            key:key
        });
    },
    show:function *(){
        var lid = this.query.lid, admin = 0, lesson,group;
        if (typeof lid === 'undefined') {
            this.redirect('/lesson');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        //获取课堂列表
        yield request({
            uri:config.url.api+'Classroom/List/',
            qs:{
                offset:1,
                limit:50,
                lid:lid
            },gzip:true,json:true
        }).then(function(data){
            if(data.code  === 0){
                clazzes = data.list;
            }else{
                console.error('Classroom/List/'+data);
            }
        }).catch(function(err){
            console.error(err.message);
        });
        //获取课程详情
        yield request({
            uri: config.url.api + '/Lesson/Get/',
            qs: {
                lid: lid
            },
            gzip: true,
            json: true
        }).then(function (data) {
            if (data.code === 0) {
                lesson = data.get;
            } else {
                console.error('/Lesson/Get/' + data);
            }
        }).catch(function (err) {
            console.error(err.message);
        });
        if(typeof lesson === 'undefined'){
            this.redirect('/lesson');
        }
        //如果不是主讲教师，继续查是不是讲师
        if (key !== lesson.uid.toString()) {
            yield request({
                uri: config.url.api + '/Lessonadmin/List/',
                qs: {
                    lid: lid,
                    state: 4//已审核
                }, gzip: true, json: true
            }).then(function (data) {
                if (data.code === 0 && data.list.indexOf(key) > -1) {
                    admin = 1;
                }
            }).catch(function (err) {
                console.error(err.message);
            });
        } else {
            admin = 2;
        }
        //获取机构信息
        yield request({
            uri:config.url.api+'organ/get',
            qs:{
                oid:lesson.oid
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                group = data.get;
            }else{
                console.error('organ/get',data);
            }
        }).catch(function(err){
           console.error('organ/get',err.message);
        });
        yield this.render('lesson/show', {
            title: lesson.title,
            logo: '云课程',
            admin: admin,//2主讲教师，1教师，0普通用户
            lesson: lesson,
            key: key,
            token: token,
            config: config,
            clazzes:clazzes,
            group:group
        });
    },
    add:function *(){
        var oid = this.query.oid,group;
        if(typeof oid === 'undefined'){
            this.redirect('/lesson');
        }
        key = this.cookies.get('key');
        token = this.cookies.get('token');
        if (typeof key === 'undefined' || typeof token === 'undefined') {
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri:config.url.api+'Organ/Get/',
            qs:{
                oid:oid
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                group = data.get;
            }else{
                console.error('Organ/Get/',data);
            }
        }).catch(function(err){
           console.error('Organ/Get/',err.message);
        });
        yield this.render('lesson/add', {
            title: '添加课程',
            logo: '云课程加',
            group: group,
            config: config,
            key: key,
            token: token
        });
    }
};
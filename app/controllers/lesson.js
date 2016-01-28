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
            uri:config.url.inside.api+'/lesson/list',
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
            domain:config.url.outside.domain
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
            uri: config.url.inside.api + 'Lesson/Get/',
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
                uri: config.url.inside.api + '/Lessonadmin/List/',
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
            config:{
                url:config.url.outside
            }
        });
    },
    me:function *(){
        var lessons,count;
        key = this.cookies.get('key');
        if (typeof key === 'undefined'){
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
           uri:config.url.inside.api+'lesson/info',
            qs:{
                uid:key
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                count = Math.ceil(data.info.Count/9);
            }else{
                console.error('lesson/info',data);
            }
        }).catch(function(err){
            console.error('lesson/info',err.message);
        });
        yield request({
            uri:config.url.inside.api+'/lesson/list',
            qs:{
                uid:key,
                limit:9,
                offset:1
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
            key:key,
            count:count
        });
    },
    admin:function *(){
      var lessons=[],lids;
        key = this.cookies.get('key');
        if (typeof key === 'undefined'){
            this.redirect('/login?redirect=' + encodeURIComponent(this.url));
        }
        yield request({
            uri: config.url.inside.api + 'lessonAdmin/list',
            qs: {
                uid: key
            }, gzip: true, json: true
        }).then(function(data){
            if(data.code === 0){
                lids = data.list;
            }else{
                console.error('lessonAdmin/list',data);
            }
        }).catch(function(err){
            console.error('lessonAdmin/list',err.message);
        });
        if(lids!=='undefined'&&lids.length >0){
            lids.map(function(ele){
                request({
                    uri:config.url.inside.api+'/lesson/get',
                    qs:{
                        lid:ele.lid
                    },gzip:true,json:true
                }).then(function(data){
                    if(data.code === 0){
                        lessons.push(data.get);
                    }else{
                        console.error('/lesson/get',data);
                    }
                }).catch(function(err){
                    console.error('/lesson/get',err.message);
                });
            });

        }

        yield this.render('lesson/admin',{
           title:'讲师课程',
            logo:"云课程",
            lessons:lessons,
            key:key
            //count:Math.ceil(lids.length/9)
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
            uri:config.url.inside.api+'Classroom/List/',
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
            uri: config.url.inside.api + '/Lesson/Get/',
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
        if (lesson !== undefined && key !== lesson.uid.toString()) {
            yield request({
                uri: config.url.inside.api + '/Lessonadmin/List/',
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
        yield request({
            uri:config.url.inside.api+'lessonUser/Get/',
            qs:{
                uid:key,
                lid:lid
            },gzip:true,json:true
        }).then(function(data){
            if(data.code === 0){
                if(typeof data.get.id != 'undefined'){
                    admin = -1
                }else if(admin==0){
                    admin = -2;
                }
            }
        }).catch(function(err){
            console.log('lessonUser/Get/',err.message);
        });
        //获取机构信息
        yield request({
            uri:config.url.inside.api+'organ/get',
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
            config: {
                url:config.url.outside
            },
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
            uri:config.url.inside.api+'Organ/Get/',
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
            config: {
                url:config.url.outside
            },
            key: key,
            token: token
        });
    }
};
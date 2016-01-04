/**
 * Created by zhangruofan on 2015/12/28.
 */
var app =  require('koa')(),
    render = require('koa-swig'),
    favicon = require('koa-favicon'),
    mount = require('mount-koa-routes')
    ;

mount(app,__dirname+'/app/routes',true);
app.context.render=render({
    root:__dirname+'/app/views',
    autoescape: true,
    cache: false, //'memory'
    ext: 'html'
});
app.use(favicon(__dirname+"/public/img/logo/favicon.ico"));
app.use(require('koa-static')(__dirname+'/public'));

module.exports = app;


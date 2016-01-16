/**
 * Created by zhangruofan on 2015/12/28.
 */
var app =  require('koa')(),
    render = require('koa-swig'),
    favicon = require('koa-favicon'),
    mount = require('mount-koa-routes'),
    cache = 'memory'
    ,env  = process.env.NODE_ENV || 'develop';

if(env.toLowerCase() != 'production') {
    app.use(favicon(__dirname + "/public/img/logo/favicon.ico"));
    app.use(require('koa-static')(__dirname + '/public'));
    cache = false;
}
mount(app,__dirname+'/app/routes');
app.context.render=render({
    root:__dirname+'/app/views',
    autoescape: true,
    cache: cache,
    ext: 'html'
});
module.exports = app;


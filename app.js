var app =  require('koa')(),
    render = require('koa-swig'),
    mount = require('mount-koa-routes'),
    cache = 'memory',
    env  = process.env.NODE_ENV || 'development';

if(env.toLowerCase() != 'production') {
    app.use(require('koa-favicon')(__dirname + "/public/img/logo/favicon.ico"));
    app.use(require('koa-static')(__dirname + '/public'));
    cache = false;
}
mount(app,__dirname+'/app/routes',false);
app.context.render=render({
    root:__dirname+'/app/views',
    autoescape: true,
    cache: cache,
    ext: 'html'
});
module.exports = app;

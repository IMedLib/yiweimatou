/**
 * Created by zhangruofan on 2016/1/15.
 */
var path = require('path')
    , env = process.env.NODE_ENV || 'development';

env = env.toLowerCase();
var file = path.join(__dirname,env);
try {
    var config = module.exports = require(file);
}catch (err){
    console.error('can not load config :[%s] %s',env,file);
}


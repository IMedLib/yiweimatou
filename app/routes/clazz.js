/**
 * Created by zhangruofan on 2016/1/5.
 */
var router = require('koa-router')(),
    clazzCtrl = require('../controllers/clazz');

router.get('/edit/:id',clazzCtrl.edit);

module.exports=router;

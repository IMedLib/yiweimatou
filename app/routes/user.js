/**
 * Created by zhangruofan on 2015/12/28.
 */
var router = require('koa-router')(),
    userCtrl = require('../controllers/user');

router.get('/home',userCtrl.home);
module.exports = router;
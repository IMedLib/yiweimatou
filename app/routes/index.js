/**
 * Created by zhangruofan on 2015/12/28.
 */
var router = require('koa-router')(),
    indexCtrl = require('../controllers/index');

router.get('/', indexCtrl.index);
router.get('index', indexCtrl.index);
router.get('login',indexCtrl.login);
router.get('register',indexCtrl.register);

module.exports = router;
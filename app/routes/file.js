/**
 * Created by zhangruofan on 2016/1/6.
 */
var router = require('koa-router')(),
    fileCtrl = require('../controllers/file');

router.get('/me',fileCtrl.me);
router.get('/add',fileCtrl.add);

module.exports = router;
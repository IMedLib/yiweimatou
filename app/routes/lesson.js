/**
 * Created by zhangruofan on 2016/1/5.
 */
var router = require('koa-router')(),
    lessonCtrl = require('../controllers/lesson');

router.get('/edit',lessonCtrl.edit);
router.get('/',lessonCtrl.index);
router.get('/show',lessonCtrl.show);
router.get('/me',lessonCtrl.me);
router.get('/add',lessonCtrl.add);
router.get('/admin',lessonCtrl.admin);

module.exports=router;
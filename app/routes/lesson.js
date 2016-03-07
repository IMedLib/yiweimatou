/**
 * Created by zhangruofan on 2016/1/5.
 */
var router = require('koa-router')(),
    lessonCtrl = require('../controllers/lesson');

router.get('/edit/:id', lessonCtrl.edit);
router.get('/', lessonCtrl.index);
router.get('/index', lessonCtrl.index);
router.get('/:id', lessonCtrl.show);
router.get('/me', lessonCtrl.me);
router.get('/add/:id', lessonCtrl.add);
router.get('/admin', lessonCtrl.admin);

module.exports = router;

/**
 * Created by zhangruofan on 2015/12/31.
 */
var router = require('koa-router')(),
    yunbookCtrl = require('../controllers/yunbook');

router.get('/me',yunbookCtrl.me);
router.get('/',yunbookCtrl.index);
router.get('/:id',yunbookCtrl.leaflet);
router.get('/clazz/:id',yunbookCtrl.clazz);
router.get('/index',yunbookCtrl.index);
router.get('/add',yunbookCtrl.add);

module.exports=router;

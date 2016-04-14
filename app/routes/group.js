/**
 * Created by zhangruofan on 2016/1/4.
 */
var router =  require('koa-router')(),
    groupCtrl = require('../controllers/group');

router.get('/',groupCtrl.index);
router.get('/:id',groupCtrl.show);
router.get('/me',groupCtrl.me);
// router.get('/edit/:id',groupCtrl.edit);
router.get('/add',groupCtrl.add);

module.exports=router;

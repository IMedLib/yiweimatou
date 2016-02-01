var router = require('koa-router')(),
    mCtrl = require('../controllers/medicalimg.js');

router.get('/me',mCtrl.me);
router.get('/add',mCtrl.add);
module.exports = router;
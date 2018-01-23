const Router = require('koa-router');
const router = new Router();
const authorization = require('./auth.js');

router.use('/shopify', authorization.routes(), authorization.allowedMethods());
//router.get('/shopify', authorization.auth);
module.exports = router;
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile('login.html', { root: 'views' });
});
const user = require('../app/controller/user.controller.js');
router.post('/signup', user.create);
router.post('/login', user.login);
router.post('/changepassword', user.changePass);
router.post('/updateinfo', user.updateInfo);
router.get('/deleteaccount', user.deleteuser);
module.exports = router;
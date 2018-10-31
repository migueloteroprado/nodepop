'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.locals.title = res.__('Welcome to');
	res.locals.page = 'home';
	res.render('index');
});

module.exports = router;

var express = require('express');
var router = express.Router();

// express validator
const { query, validationResult } = require('express-validator/check');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});

module.exports = router;

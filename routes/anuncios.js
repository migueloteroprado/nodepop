var express = require('express');
var router = express.Router();

// express validator
const { query, validationResult } = require('express-validator/check');

/* GET home page. */
router.get('/', function(req, res) {
	// procesar filtros

	// obtener anuncios segun filtros y paginación
	res.render('anuncios');
});

module.exports = router;

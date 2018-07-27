var express = require('express');
var router = express.Router();

const { query, validationResult } = require('express-validator/check');

/* GET home page. */
router.get('/', function (req, res) {
	res.render('index');
});


// Parámetros en el query string
router.get('/enquerystring', [ // validations
	query('talla').isNumeric().withMessage('debe ser numérico')
	// (podría haber varias validaciones)
	// , query('talla').isNumeric().withMessage('debe ser numérico'), 
], (req, res, next) => {
	console.log(req.query);
	validationResult(req).throw(); // pasa los errores de validación a next(err)

	// si la ejecución llega aquí es que todos los parámetros son válidos
	res.send('ok');
});



module.exports = router;

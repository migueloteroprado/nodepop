var express = require('express');
var router = express.Router();
const axios = require('axios');

// express validator
const { query, validationResult } = require('express-validator/check');

/**
 * GET /
 * Renders a list of documents sorted, filtered and paginated
 */ 
router.get('/', [ // validations
	query('venta').optional().isIn(['true', 'false']).withMessage('must be "true" or "false"'),
	query('tag').optional().isIn(['work', 'lifestyle','motor','mobile',]).withMessage('must be "work", "lifestyle", "motor" or "mobile"'),
	query('precio').optional().matches(/(([0-9]+(.[0-9]+)?)|-([0-9]+(.[0-9]+)?)|([0-9]+(.[0-9]+)?)-|([0-9]+(.[0-9]+)?)-([0-9]+(.[0-9]+)?))$/).withMessage('must be "(exact.price)", "(min.price)-", "-(max.price)" or "(min.price)-(max.price)"')
], async function(req, res, next) {
	try {

		validationResult(req).throw();

		// obtener artículos del API, paśandole los filtros obtenidos en el querystring
		const querystring = req._parsedUrl.search !== null ? req._parsedUrl.search : '';
		const response = await axios.get(`${process.env.API_URL}/anuncios/${querystring}`);
		if (response.data.success) {
			const anuncios = response.data.result;
			res.render('anuncios', { anuncios: anuncios });
		}
		else {
			throw new Error(result);
		}

		// obtener anuncios segun filtros y paginación
		//res.render('anuncios');
	}
	catch (err) {
		next(err);
	}
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Anuncio = require('../models/Anuncio');
const { validations, getFilters } = require('../models/helperAnuncio');

// express validator
const { query, validationResult } = require('express-validator/check');

/**
 * GET /
 * Renders a list of documents sorted, filtered and paginated
 */ 
router.get('/', validations, async function(req, res, next) {
	try {

		// validate params from querystring
		validationResult(req).throw();

		// build filters object from querystring values
		const filters = getFilters(req.query);

		// get query config
		const limit = parseInt(req.query.limit);
		const start = parseInt(req.query.start);
		const fields = req.query.fields;
		const sort = req.query.sort;

		// get the collections from database
		const anuncios = await Anuncio.list(filters, limit, start, fields, sort);
		const count = await Anuncio.count(filters);
		
		const page = Math.floor(start/limit) + 1;
		const totalPages = Math.ceil(count/limit);

		// render page
		res.render('anuncios', {anuncios: anuncios, count: count, page: page, totalPages: totalPages});
	}
	catch (err) {
		next(err);
	}
});

module.exports = router;

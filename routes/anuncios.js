const express = require('express');
const router = express.Router();
const Anuncio = require('../models/Anuncio');
const { validations, getFilters } = require('../models/helperAnuncio');

// express validator
const { query, validationResult } = require('express-validator/check');



const queryString = require('query-string');



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
		const start = parseInt(req.query.start || 0);
		const fields = req.query.fields;
		const sort = req.query.sort;

		// get the collections from database
		const anuncios = await Anuncio.list(filters, limit, start, fields, sort);
		const count = await Anuncio.count(filters);
		
		// calculate current page and total pages from limit and start, will be passed to the rendered view for pagination
		const page = Math.floor(start/limit) + 1;
		const totalPages = Math.ceil(count/limit);

		// Obtain filters and sort from querystring, without start and limit
		// (Pagination buttons will modify only 'start' and 'limit' parameters, and will keep all others (filters and sort)
		const queryParsed = queryString.parseUrl(req.originalUrl).query;
		let queryFilters = {};
		let keys = Object.keys(queryParsed);
		for (let i=0; i<keys.length; i++) {
			if (['start', 'limit'].indexOf(keys[i]) === -1) {
				queryFilters[keys[i]] = queryParsed[keys[i]];
			}
		}
		const filtersInQuery = queryString.stringify(queryFilters);

		// render page
		res.render('anuncios', {anuncios: anuncios, page: page, totalPages: totalPages, limit: limit, filtersInQuery: filtersInQuery});
	}
	catch (err) {
		next(err);
	}
});

module.exports = router;

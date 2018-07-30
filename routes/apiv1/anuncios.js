const express = require('express');
const router = express.Router();
var createError = require('http-errors');
const mongoose = require('mongoose');
const Anuncio = require('../../models/Anuncio');
const { queryValidations, bodyValidations, getFilters } = require('../../models/helperAnuncio');

// express validator
const { query, body, validationResult } = require('express-validator/check');

/**
 * GET /
 * Returns a list of documents sorted, filtered and paginated
 */ 
router.get('/', queryValidations, async function(req, res, next) {

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

		// query database
		const anuncios = await Anuncio.list(filters, limit, start, fields, sort);

		// return result
		res.json({success: true, result: anuncios});
	}		
	catch(err) {
		next(err);
	}
});

/**
 * GET /tags
 * Obtain all existing tags from anuncios
 */
router.get('/tags', async (req, res, next) => {
	try {
		// Get all distinct tags from all anuncios
		const tags = await Anuncio.distinct('tags');
		res.json({ success: true, tags: tags });
	}
	catch (err) {
		next(err);
	}
});

/**
 * POST /
 * Inserts a new document in database
 */
router.post('/', bodyValidations, async (req, res, next) => {
	try {

console.log(req.body);		

		// validate data from body
		validationResult(req).throw();

		// get data from request body
		const anuncio = req.body;

		// create a new document using the model
		const newAnuncio = new Anuncio(anuncio);

		// save document in database
		const savedAnuncio = await newAnuncio.save();

		// return result
		res.json({ success: true, result: savedAnuncio });

	} catch(err) {
		next(err);
	}
});

module.exports = router;
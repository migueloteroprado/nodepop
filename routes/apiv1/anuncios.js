const express = require('express');
const router = express.Router();
var createError = require('http-errors');
const mongoose = require('mongoose');
const Anuncio = require('../../models/Anuncio');
const { validations, getFilters } = require('../../models/helperAnuncio');

// express validator
const { query, validationResult } = require('express-validator/check');

/**
 * GET /
 * Returns a list of documents sorted, filtered and paginated
 */ 
router.get('/', validations, async function(req, res, next) {

	try {

		// validate params from querystring
		//validationResult(req).throw();

		// build filters object from querystring values
		const filters = getFilters(req.query);

		// get query config
		const limit = parseInt(req.query.limit);
		const start = parseInt(req.query.start);
		const fields = req.query.fields;
		const sort = req.query.sort;

		const anuncios = await Anuncio.list(filters, limit, start, fields, sort);
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
		const tags = await Anuncio.distinct('tags');
		console.log(tags);
		res.json({ success: true, tags: tags });
	}
	catch (err) {
		next(err);
	}
});

/**
 * POST /
 * Inserts a document in database
 */
router.post('/', async (req, res, next) => {
	try {
		// get data from request body
		const anuncio = req.body;
		// create a new document using the model
		const newAnuncio = new Anuncio(anuncio);
		// save document in database
		const savedAnuncio = await newAnuncio.save();
		res.json({ success: true, result: savedAnuncio });
	} catch(err) {
		next(err);
	}
});

module.exports = router;
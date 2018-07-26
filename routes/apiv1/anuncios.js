const express = require('express');
const router = express.Router();
var createError = require('http-errors');
const mongoose = require('mongoose');
const Anuncio = require('../../models/Anuncio');


// express validator
const { query, validationResult } = require('express-validator/check');

/**
 * GET /
 * Returns a list of documents sorted, filtered and paginated
 */ 

 /*
tag​=mobile
&​venta​=false
&​nombre=ip
&precio=50-
&start=0&limit=2
&sort=precio
&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWZkOWFiZGE4Y2QxZDlhMj
*/

router.get('/', async function(req, res, next) {
	try {
		// proccess filters
		let filters = {};
		const params = req.query;
		// filter by tag
		if (params.tag) {
			filters.tags = params.tag;
		}
		// filter by type
		if (params.venta) {
			filters.venta = (params.venta === 'true');
		}
		// filter by name
		if (params.nombre) {
			filters.nombre = params.nombre;
		}
		// filter by price
		if (params.precio) {
			const prices = params.precio.split('-');
			console.log(prices);
			if (prices[1]) {
				filters.precio = {$gte: Number(prices[0]), $lte: Number(prices[1])};
			} else {
				if (params.precio.indexOf('-') === 0) {
					filters.precio = { $lte: Number(prices[0]) }
				} else {
					filters.precio = { $gte: Number(prices[0]) }
				}
			}
		}
		const sortField = params.sort ? params.sort : null;
		const start = params.start ? Number(params.start) : null;
		const limit = params.limit ? Number(params.limit) : null;

		console.log(filters);
		const anuncios = await Anuncio.find(filters).skip(start).limit(limit).sort(sortField).exec();
		res.json({success: true, result: anuncios});
	} catch(err) {
		next(err);
		return;
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
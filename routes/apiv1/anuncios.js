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
router.get('/', [ // validations
			query('venta').isIn(['true', 'false']).withMessage(`must be 'true' or 'false'`),
			query('')
  		// (podría haber varias validaciones)
  		// , query('talla').isNumeric().withMessage('debe ser numérico'), 
		], async function(req, res, next) {

	try {

		validationResult(req).throw();

		// recuperar datos de entrada
		const nombre = req.query.nombre;
		const tag = req.query.tag;
		const venta = req.query.venta;
		const precio = req.query.precio;
		const limit = parseInt(req.query.limit);
		const start = parseInt(req.query.start);
		const fields = req.query.fields;
		const sort = req.query.sort;

		// create empty filter
		const filters = {};
		
		// filter by name, obtaining all documents whose name starts by given value, case insensitive
		if (nombre) {
			filters.nombre = new RegExp('^' + req.query.nombre, "i");
		}
		// filter by tag
		if (tag) {
			filters.tags = tag;
		}
		// filter by venta
		if (venta) {
			filters.venta = venta.toLowerCase() === 'true';
		}
		// filter by price
		if (precio) {
			const position = precio.indexOf('-');
			if (position === -1) {
				filters.precio = parseInt(precio);
			}
			else if (position === 0) {
				filters.precio = { $lte: parseInt(precio.substring(1, precio.length+1)) } ;
			}
			else if (position === precio.length -1) {
				filters.precio = { $gte: parseInt(precio.substring(0, precio.length)) } ;
			}
			else {
				const precios = precio.split('-');
				filters.precio = { $gte: parseInt(precios[0]), $lte: parseInt(precios[1]) } ;
			}
		} 

		console.log(filters);
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
		tags = await Anuncio.distinct('tags', {});
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
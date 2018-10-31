'use strict';

const express = require('express');
const router = express.Router();

// express-validator
const { param, validationResult } = require('express-validator/check');

// querystring utilities, to get an object from querystring and viceversa
const queryString = require('querystring');

// Anuncio model
const Anuncio = require('../models/anuncios/Anuncio');

// function that returns a filters object created form querystring parameters, to pass to the model 'list' static method
const getFilters = require('../lib/anuncios/filter');

// Arrays of validators for GET, POST and PUT requests 
const { queryValidations } = require('../lib/anuncios/validators');

// constants
const { MAX_LIMIT }  = require('../lib/constants');

// middleware to verify if user is logged
const sessionAuth = require('../lib/auth/sessionAuth');

// multer uploader for foto field image file
const path = require('path');
const fotoFolder = path.join(__dirname, '..', 'public', 'images', 'anuncios');
const uploader = require('../lib/anuncios/uploader')(fotoFolder);

// Arrays of validators for GET, POST and PUT requests 
const { bodyValidationsPost, bodyValidationsPut } = require('../lib/anuncios/validators');

// Thumbnail generation Microservice
const { generateThumbnail, deleteImage } = require('../microservices/thumbnailClient');

// All querys to this roter require authentication
//router.use(sessionAuth());

/**
 * GET /
 * Renders a list of documents sorted, filtered and paginated
 */ 
router.get('/', queryValidations, async (req, res, next) => {
	try {

		// validate params from querystring
		validationResult(req).throw();

		// build filters object from querystring values
		const filters = getFilters(req.query);

		// get query config
		const limit = Math.min(parseInt(req.query.limit), MAX_LIMIT); // maximum MAX_LIMIT documents at one time 
		const start = parseInt(req.query.start) || 0;
		const fields = req.query.fields;
		const sort = req.query.sort;

		// get the collections from database
		const anuncios = await Anuncio.list(filters, limit, start, fields, sort);
		const count = await Anuncio.count(filters);
		
		// calculate current page and total pages from limit and start, will be passed to the rendered view for pagination
		const currentPage = limit > 0 ? Math.floor(start/limit) + 1 : 1;
		const totalPages = limit > 0 ? Math.ceil(count/limit) : 1;

		// Extract filters and sort params from querystring, without start and limit. This string will be passed to the view to render pagination links 
		// (Pagination button links will modify only 'start' and 'limit' parameters, and will keep all others untouched (filters, sort and fields)
		const queryParsed = queryString.parse(req.originalUrl.split('?')[1]);
		let queryFilters = {};
		let keys = Object.keys(queryParsed);
		for (let i=0; i<keys.length; i++) {
			if (['start', 'limit'].indexOf(keys[i]) === -1) {
				queryFilters[keys[i]] = queryParsed[keys[i]];
			}
		}
		const filtersInQuery = queryString.stringify(queryFilters);

		// set page title
		res.locals.title = 'Nodepop - Anuncios';

		// render page
		res.render('anuncios/anuncios', {anuncios: anuncios, currentPage: currentPage, totalPages: totalPages, limit: limit, filtersInQuery: filtersInQuery});
	}
	catch (err) {
		next(err);
	}
});

/**
 * GET /add
 * Renders a form to add a new Anuncio
 */ 
router.get('/add', sessionAuth(), async (req, res, next) => {
	res.locals.title = 'Add Anuncio';
	res.render('anuncios/addAnuncio.html');
});

/**
 * POST /
 * Adds a new Anuncio
 */
router.post('/', sessionAuth(), uploader.single('foto'), bodyValidationsPost, async (req, res, next) => {
	
	try {

		// validate data from body and throw possible validation errors
		validationResult(req).throw();

		// get data from request body
		const anuncio = req.body;
		
		anuncio.user = {
			_id: req.session.authUser._id,
			email: req.session.authUser.email
		};

		// create a new document using the model
		const newAnuncio = new Anuncio(anuncio);

		// save document in database
		const savedAnuncio = await newAnuncio.save();

		// send message to thumbnail generation microservice, passing file name, width and height
		generateThumbnail({
			fileName: req.body.foto, 
			width: 100, 
			height: 100 
		}, (err, res) => {
			if (err) {
				console.log('Error generating thumbnail: ', err);
				return;
			}
			console.log('Thumbnail succesfully generated');
			return;
		});

		// OK, set message an redirect to /anuncios
		req.flash('success', res.__('Announcement successfully created'));		
		res.redirect('/anuncios/add');

	} catch (err) {
		req.flash('error', `Error: ${res.__(err.message)}`);		
		next(err);
	}	

});

/** GET /:id/edit
 * Shows a form to update one Anuncio
 */
router.get('/:id/edit', [param('id').isMongoId().withMessage('invalid ID')], async (req, res, next) => {

	try {
		// validate data from body and throw possible validation errors
		validationResult(req).throw();

		const foundAnuncio = await Anuncio.findById(req.params.id);
		if (!foundAnuncio) {
			req.flash('error', 'Anuncio nof found in database');
			res.redirect('/anuncios');
		}
		res.locals.title = 'Edit Anuncio';
		res.render('anuncios/editAnuncio', { anuncio: foundAnuncio }); 

	} catch(err) {
		req.flash('error', `Error: ${err.message}`);
		res.redirect('/anuncios');
	}
});

/** PUT /:id
 * Updates one document
 */
router.put('/:id', sessionAuth(), uploader.single('foto'), [
	...bodyValidationsPut,
	param('id').isMongoId().withMessage('invalid ID')
], async (req, res, next) => {

	try {

		// validate data from body and throw possible validation errors
		validationResult(req).throw();

		const _id = req.params.id;

		// check if logged user has permissions to update (is the anuncio creator or has an admin role)
		const originalAnuncio = await Anuncio.findById(_id).exec();
		if (!(originalAnuncio.user && (req.session.authUser._id === originalAnuncio.user || req.session.authUser.role === 'admin'))) {
			req.flash('You don\'t have permissions to update this anuncio');
			res.redirect(req.header('Referer'));
		} else {
			
			const anuncio = req.body;
			const updatedAnuncio = await Anuncio.findByIdAndUpdate(_id, anuncio, { new: true }).exec();

			// If a new photo was uploaded, update thumbnail
			// Send message to thumbnail generator microservice, passing file name, width and height
			if (req.body.foto) {
				generateThumbnail({
					fileName: req.body.foto, 
					width: 100, 
					height: 100 
				}, (err, res) => {
					if (err) {
						console.log('Error generating thumbnail: ', err);
						return;
					}
					console.log('Thumbnail succesfully generated');
					return;
				});
			}

			// OK, set flash message and redirect to /anuncios
			req.flash('success', res.__('Announcement successfully updated'));		
			res.redirect('/anuncios');
		}
	} catch (err) {
		next(err);
	}
});

/** DELETE /:id
 * Delete one anuncio
 */
router.delete('/:id', [
	param('id').isMongoId().withMessage('invalid ID')
], async (req, res, next) => {
	try {

		// validate id param
		validationResult(req).throw();

		const _id = req.params.id;

		// Send message to microservice to delete image and thumbnail(s)
		// Get document from database
		const anuncio = await Anuncio.findById(_id).exec();
		deleteImage({fileName: anuncio.foto}, (err, res) => {
			if (err) {
				console.log('Error generating thumbnail: ', err);
				return;
			}
			console.log('Image and Thumbnail(s) succesfully deleted');
			return;
		});
		
		// delete anuncio from database
		const deleted = await Anuncio.remove({
			_id: _id
		}).exec();

		// OK, set flash message and redirect to /anuncios
		req.flash('success', res.__('Announcement successfully deleted'));		
		res.redirect('/anuncios');

	} catch (err) {
		// pass error to next middleware
		next(err);
	}

});

module.exports = router;

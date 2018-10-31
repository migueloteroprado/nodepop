'use strict';

const express = require('express');
const router = express.Router();
const createError = require('http-errors');

// authentication: check if user provides a valid token
const jwtAuth = require('../../lib/auth/jwtAuth');

// express validator
const {	param, validationResult } = require('express-validator/check');

// Anuncio model
const Anuncio = require('../../models/anuncios/Anuncio');

// constants
const { MAX_LIMIT }  = require('../../lib/constants');

// function that returns a filters object created form querystring parameters, to pass to the model 'list' static method
const getFilters = require('../../lib/anuncios/filter');

// multer uploader for foto field image file
const path = require('path');
const fotoFolder = path.join(__dirname, '..', '..', 'public', 'images', 'anuncios');
const uploader = require('../../lib/anuncios/uploader')(fotoFolder);

// Arrays of validators for GET, POST and PUT requests 
const { queryValidations,	bodyValidationsPost, bodyValidationsPut } = require('../../lib/anuncios/validators');

// middleware to verify if user provides a valid authentication JWT
router.use(jwtAuth());

// translations
const i18n = require('../../lib/i18nConfigure')();

// Thumbnail generation Microservice
const { generateThumbnail, deleteImage } = require('../../microservices/thumbnailClient');

/**
 * GET /
 * Returns a list of documents sorted, filtered and paginated
 */
router.get('/', queryValidations, async (req, res, next) => {

	try {

		// validate params from querystring
		validationResult(req).throw();

		// build filters object from querystring values
		const filters = getFilters(req.query);

		// get query config
		const limit = req.query.limit ? Math.min(parseInt(req.query.limit), MAX_LIMIT) : MAX_LIMIT; // maximum MAX_LIMIT documents at one time 
		const start = parseInt(req.query.start || 0);
		const fields = req.query.fields;
		const sort = req.query.sort;

		// query database
		const anuncios = await Anuncio.list(filters, limit, start, fields, sort);

		// return result
		res.json({
			success: true,
			result: anuncios
		});
	} catch (err) {
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
		res.json({
			success: true,
			result: tags
		});
	} catch (err) {
		next(err);
	}
});

/** GET /:id
 * Get one document by Id
 */
router.get('/:id', [
	param('id').isMongoId().withMessage(i18n.__('Invalid ID'))
], async (req, res, next) => {

	try {

		// validate data from req
		validationResult(req).throw();

		const _id = req.params.id;

		// Get document from database
		const anuncio = await Anuncio.findById(_id).exec();

		if (!anuncio) {
			next(createError(404));
			return;
		}

		// return result
		res.json({
			success: true,
			result: anuncio
		});
	} catch (err) {
		next(err);
	}
});

/**
 * POST /
 * Upload image file, generate thumbnail using a cote microservice, and insert new Anuncio into database
 */
router.post('/', uploader.single('foto'), bodyValidationsPost, async (req, res, next) => {

	try {

		// validate data from body and throw possible validation errors
		validationResult(req).throw();

		// get data from request body
		const anuncio = req.body;

		// add anuncio author (logged user)
		anuncio.user = req.apiUserId;

		// create a new document using the model
		const newAnuncio = new Anuncio(anuncio);

		// save document in database
		const savedAnuncio = await newAnuncio.save();

		// send message to thumbnail generation microservice, passing file name, width and height
		generateThumbnail({
			fileName: req.body.foto, 
			width: 100, 
			height: 100 
		}, (err, result) => {
			if (err) {
				console.log(`${res.__('Error generating thumbnail')}: ${err.message}`);
				return;
			}
			console.log(res.__('Thumbnail succesfully generated'));
			return;
		});

		// return result
		res.json({
			success: true,
			result: savedAnuncio
		});

	} catch (err) {
		next(err);
	}
});


/** PUT /:id
 * Updates one document
 */
router.put('/:id', uploader.single('foto'), [
	...bodyValidationsPut,
	param('id').isMongoId().withMessage(i18n.__('Invalid ID'))
], async (req, res, next) => {

	try {

		// validate data from body and throw possible validation errors
		validationResult(req).throw();

		const _id = req.params.id;

		// check if logged user has permissions to update (is the anuncio creator or has an admin role)
		const originalAnuncio = await Anuncio.findById(_id).exec();
		if (!(req.apiUserId === originalAnuncio.user._id || req.apiUserRole === 'admin')) {
			throw new Error(res.__('You don\'t have permissions to update this anuncio'));
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
				}, (err, result) => {
					if (err) {
						console.log(`${res.__('Error generating thumbnail')}: ${err.message}`);
						return;
					}
					console.log(res.__('Thumbnail succesfully generated'));
					return;
				});
			}

			res.json({
				success: true,
				result: updatedAnuncio
			});
		}
	} catch (err) {
		next(err);
	}
});

/** DELETE /:id
 * Delete one anuncio
 */
router.delete('/:id', [
	param('id').isMongoId().withMessage(i18n.__('Invalid ID'))
], async (req, res, next) => {
	try {

		// validate id param
		validationResult(req).throw();

		const _id = req.params.id;

		// Send message to microservice to delete image and thumbnail(s)
		// Get document from database
		const anuncio = await Anuncio.findById(_id).exec();
		deleteImage({fileName: anuncio.foto}, (err, result) => {
			if (err) {
				console.log(`${res.__('Error generating thumbnail')}: ${err.message}`);
				return;
			}
			console.log(res.__('Image and Thumbnail succesfully deleted'));
			return;
		});
		
		// delete anuncio from database
		const deleted = await Anuncio.remove({
			_id: _id
		}).exec();

		// return result
		res.json({
			sucess: true,
			result: {
				deleted: deleted.n
			}
		});
	} catch (err) {
		// pass error to next middleware
		next(err);
	}

});

module.exports = router;
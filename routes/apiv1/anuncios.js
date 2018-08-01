'use strict';

const express = require('express');
const router = express.Router();
var createError = require('http-errors');

const multer  = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, 'public/images/anuncios');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({storage: storage}).single('foto');

const Anuncio = require('../../models/anuncios/Anuncio');

/**
 * Auxiliar module, returns: 
 * - getFilters: Method that returns a filters object created form querystring parameters, to pass to model list method
 * - queryValidations: Array of validations for querystring in GET requests
 * - bodyValidationsPost: Array of validations for body object passed to POST requests
 * - bodyValidationsPut: Array of validations for body object passed to PUT requests
*/
const { queryValidations, bodyValidationsPost, bodyValidationsPut, getFilters } = require('../../models/anuncios/helperAnuncio');

// express validator
const { param, validationResult } = require('express-validator/check');

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
		const limit = parseInt(req.query.limit);
		const start = parseInt(req.query.start);
		const fields = req.query.fields;
		const sort = req.query.sort;

		// query database
		const anuncios = await Anuncio.list(filters, limit, start, fields, sort);

		// return result
		res.json({
			success: true, 
			result: anuncios
		});
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
		res.json({ 
			success: true, 
			result: tags 
		});
	}
	catch (err) {
		next(err);
	}
});

/** GET /:id
 * Get one document by Id
 */
router.get('/:id', [
	param('id').isMongoId().withMessage('invalid ID')
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
	}
	catch (err) {
		next(err);
	}
});

/**
 * POST /
 * Two middlewares: 
 * The first uploads image and add file name to req.body
 * The second apllies validators and insert document in database.
 */

router.post('/', (req, res, next) => {

	// upload foto
	upload(req, res, function (err) {
			if (err) {
					return next(err);
			}

			// check if file was received and uploaded
			if (!(req.file && req.file.originalname)) {
					return next(new Error('foto is required'));
			}

			// extract original name from uploaded file, and add it to req.body field 'foto'.
			req.body.foto = req.file.originalname;
			
			// call next middleware
			return next();
	});
});

router.post('/', bodyValidationsPost, async (req, res, next) => {

	try {
			// validate data from body
			validationResult(req).throw();

			// get data from request body
			const anuncio = req.body;

			// create a new document using the model
			const newAnuncio = new Anuncio(anuncio);

			// save document in database
			const savedAnuncio = await newAnuncio.save();

			// return result
			res.json({ 
					success: true, 
					result: savedAnuncio 
			});

	} catch(err) {
			next(err);
	}
});

/** PUT /:id
 * Updates one document
 */
router.put('/:id', [
	...bodyValidationsPut,
	param('id').isMongoId().withMessage('invalid ID')
], async (req, res, next) => {

	try {
		// validate data from body
		validationResult(req).throw();

		const _id = req.params.id;
		const anuncio = req.body;
		const updatedAnuncio = await Anuncio.findByIdAndUpdate(_id, anuncio, { new: true }).exec();
		res.json({ 
			success: true, 
			result: updatedAnuncio 
		});
	}
	catch (err) {
		next(err);
	}
});

/** DELETE /:id
 * Delete one document
 */
router.delete('/:id', [
	param('id').isMongoId().withMessage('invalid ID')
], async (req, res, next) => {
	try {

		// validate id param
		validationResult(req).throw();

		const _id = req.params.id;
		const deleted = await Anuncio.remove({_id: _id}).exec();
		console.log(deleted);
		res.json({ 
			sucess: true, 
			result: { 
				deleted: deleted.n 
			} 
		});
	}
	catch (err) {
		next(err);
	}

});

module.exports = router;
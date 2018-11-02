'use strict';

const express = require('express');
const router = express.Router();
const createError = require('http-errors');

// constants
const { MAX_LIMIT }  = require('../../lib/constants');

// express-validator
const { param, validationResult } = require('express-validator/check');

// User model
const User = require('../../models/users/User');

// function that returns a filters object created form querystring parameters, to pass to the model 'list' static method
const getFilters = require('../../lib/users/filter');

// Arrays of validators for GET, POST and PUT requests 
const { queryValidations,	bodyValidationsPost, bodyValidationsPut } = require('../../lib/users/validators');

// authentication: check if user provides a valid token
const jwtAuth = require('../../lib/auth/jwtAuth');
router.use(jwtAuth());

// translations
const i18n = require('../../lib/i18nConfigure')();

/**
 * GET /
 * Returns a list of users sorted, filtered and paginated
 */ 
router.get('/', queryValidations, async (req, res, next) => {

	try {

		// validate params from querystring
		validationResult(req).throw();

		// build filters object from querystring values
		const filters = getFilters(req.query);

		// get query config
		const limit = Math.min(parseInt(req.query.limit), MAX_LIMIT); // maximum MAX_LIMIT users at one time 
		const start = parseInt(req.query.start);
		const sort = req.query.sort;

		// query database
		const users = await User.list(filters, limit, start, sort);

		// return result
		res.json({
			success: true, 
			result: users
		});
	}		
	catch(err) {
		next(err);
	}
});

/** GET /:id
 * Get one user by Id
 */
router.get('/:id', [
	param('id').isMongoId().withMessage(i18n.__('Invalid ID'))
], async (req, res, next) => {

	try {
	
		// validate data from req
		validationResult(req).throw();

		const _id = req.params.id;

		// get user from databasse
		const user = await User.findById(_id).exec();

		if (!user) {
			next(createError(404));
			return;
		}

		// return result
		res.json({ 
			success: true, 
			result: user 
		});
	}
	catch (err) {
		next(err);
	}
});

/**
 * POST /
 * Inserts a new user in database
 */
router.post('/', bodyValidationsPost, async (req, res, next) => {
	try {

		// validate data from body
		validationResult(req).throw();

		// get data from request body
		const user = req.body;

		// encrypt password
		user.password = await User.hashPassword(user.password);		

		// check that user doesn't already exists
		const userExists = await User.find({ email: user.email }).exec();
		if (userExists.length > 0) {
			throw new Error(res.__('Email already in use'));
		}

		// create a new user using the model
		const newUser = new User(user);

		// save user in database
		const savedUser = await newUser.save();

		// return result
		res.json({ 
			success: true, 
			result: savedUser
		});

	} catch(err) {
		next(err);
	}
});

/** PUT /:id
 * Updates one user
 */
router.put('/:id', [
	...bodyValidationsPut,
	param('id').isMongoId().withMessage(i18n.__('Invalid ID'))
], async (req, res, next) => {

	try {
		// validate data from body
		validationResult(req).throw();

		const _id = req.params.id;
		const user = req.body;

		// if email changes, check that new email is not in use
		if (user.email) {
			// find other users with the new email 
			const userExists = await User.find({ 
				email: user.email,
				_id: { $ne: _id }
			}).exec();
			if (userExists.length > 0) {
				throw new Error(res.__('Email already in use'));
			}
		}

		// if password changes, encrypt it
		if (user.password) {
			user.password = await User.hashPassword(user.password);		
		}
		
		const updatedUser = await User.findByIdAndUpdate(_id, user, { new: true }).exec();

		res.json({ 
			success: true, 
			result: updatedUser
		});
	}
	catch (err) {
		next(err);
	}
});

/** DELETE /:id
 * Delete one user
 */
router.delete('/:id', [
	param('id').isMongoId().withMessage(i18n.__('Invalid ID'))
], async (req, res, next) => {
	try {

		// validate id param
		validationResult(req).throw();

		const _id = req.params.id;
		const deleted = await User.remove({_id: _id}).exec();
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
'use strict';

// express validator
const { query, param, body } = require('express-validator/check');

module.exports = {
	
	// obtain filter object from querystring
	getFilters: function(queryString) {
		// get filters from querystring
		const name = queryString.name;
		const email = queryString.email;

		// create empty filter
		let filters = {};

		// filter by name, obtaining all users whose name starts by given value, case insensitive
		if (name) {
			filters.name = new RegExp(name, 'i');
		}
		if (email) {
			filters.email = new RegExp(email, 'i');
		}

		return filters;
	},
	
	// validation array for querystring
	queryValidations: [
		query('name').optional({ checkFalsy: true }).not().isArray().withMessage('must be an string'),
		query('email').optional({ checkFalsy: true }).not().isArray().withMessage('must be an string'),
		query(['start', 'limit']).optional({ checkFalsy: true }).not().isArray().isInt().withMessage('must be integer'),
		query('sort').not().isArray().optional({ checkFalsy: true })
	],

	// validations array for body (POST requests)
	bodyValidationsPost: [
		body('name').not().isArray().not().isEmpty().withMessage('is required'),
		body('email').not().isArray().isEmail().normalizeEmail().withMessage('must be a valid email'),
		body('password').not().isArray().not().isEmpty().isLength({ min: 8 }).withMessage('must have 8 characters at least')
	],	

	// validations array for body (PUT requests)
	bodyValidationsPut: [
		body('name').optional().not().isArray().not().isEmpty().withMessage('is required'),
		body('email').optional().not().isArray().isEmail().normalizeEmail().withMessage('must be a valid email'),
		body('password').optional().not().isArray().not().isEmpty().isLength({ min: 8 }).withMessage('must have 8 characters at least')
	]

};

'use strict';

// express validator
const { query, body } = require('express-validator/check');


// Function to obtain a filter object from params in querystring
const getFilters = queryString => {
	// get filters from querystring
	const name = queryString.name;
	const email = queryString.email;

	// create empty filter
	let filters = {};

	// filter by name, obtaining all users whose name begins with given value, case insensitive
	if (name) {
		filters.name = new RegExp(name, 'i');
	}
	if (email) {
		filters.email = new RegExp(email, 'i');
	}

	return filters;
}

// validation array for querystring
const queryValidations = [
	query('name').optional({ checkFalsy: true }).not().isArray().withMessage('must be an string'),
	query('email').optional({ checkFalsy: true }).not().isArray().withMessage('must be an string'),
	query('start').optional({ checkFalsy: true }).not().isArray().isInt().withMessage('must be integer'),
	query('limit').optional({ checkFalsy: true }).not().isArray().isInt({max: 100}).withMessage('must be integer, maximum 100'),
	query('sort').not().isArray().optional({ checkFalsy: true })
];

// validations array for body (POST requests)
const bodyValidationsPost = [
	body('name').not().isArray().not().isEmpty().withMessage('is required'),
	body('email').not().isArray().isEmail().normalizeEmail().withMessage('must be a valid email'),
	body('password').not().isArray().not().isEmpty().isLength({ min: 6 }).withMessage('must have 6 characters at least')
];

// validations array for body (PUT requests)
const bodyValidationsPut = [
	body('name').optional().not().isArray().not().isEmpty().withMessage('is required'),
	body('email').optional().not().isArray().isEmail().normalizeEmail().withMessage('must be a valid email'),
	body('password').optional().not().isArray().not().isEmpty().isLength({ min: 6 }).withMessage('must have 6 characters at least')
]

// Objects exported by the module
module.exports = {
	getFilters,	
	queryValidations,
	bodyValidationsPost,
	bodyValidationsPut
};

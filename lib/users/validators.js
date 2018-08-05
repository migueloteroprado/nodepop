'use strict';

/**
 * This module exports an array of validators for GET, POST and PUT Requests for Users
 */

// constants
const { MAX_LIMIT }  = require('../constants');

// express validator
const { query, body } = require('express-validator/check');

// validation array for querystring
const queryValidations = [
	query('name').optional({ checkFalsy: true }).not().isArray().withMessage('must be an string'),
	query('email').optional({ checkFalsy: true }).not().isArray().withMessage('must be an string'),
	query('start').optional({ checkFalsy: true }).not().isArray().isInt().withMessage('must be integer'),
	query('limit').optional({ checkFalsy: true }).not().isArray().isInt({max: MAX_LIMIT}).withMessage('must be integer, maximum ' + MAX_LIMIT),
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
];

// Objects exported by the module
module.exports = {
	queryValidations,
	bodyValidationsPost,
	bodyValidationsPut
};

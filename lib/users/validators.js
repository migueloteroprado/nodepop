'use strict';

/**
 * This module exports an array of validators for GET, POST and PUT Requests for Users
 */

// constants
const { MAX_LIMIT }  = require('../constants');

// express validator
const { query, body } = require('express-validator/check');

// translations
const i18n = require('../i18nConfigure')();

// validation array for querystring
const queryValidations = [
	query('name').optional({ checkFalsy: true }).not().isArray().withMessage(i18n.__('must be an string')),
	query('email').optional({ checkFalsy: true }).not().isArray().withMessage(i18n.__('must be an string')),
	query('start').optional({ checkFalsy: true }).not().isArray().isInt().withMessage(i18n.__('must be integer')),
	query('limit').optional({ checkFalsy: true }).not().isArray().isInt({max: MAX_LIMIT}).withMessage(`${i18n.__('must be integer')}, ${i18n.__('maximum')} ${MAX_LIMIT}`),
	query('sort').not().isArray().optional({ checkFalsy: true })
];

// validations array for body (POST requests)
const bodyValidationsPost = [
	body('name').not().isArray().not().isEmpty().withMessage(i18n.__('is required')),
	body('email').not().isArray().isEmail().normalizeEmail().withMessage(i18n.__('must be a valid email')),
	body('password').not().isArray().not().isEmpty().isLength({ min: 6 }).withMessage(i18n.__('must have 6 characters at least'))
];

// validations array for body (PUT requests)
const bodyValidationsPut = [
	body('name').optional().not().isArray().not().isEmpty().withMessage(i18n.__('is required')),
	body('email').optional().not().isArray().isEmail().normalizeEmail().withMessage(i18n.__('must be a valid email')),
	body('password').optional().not().isArray().not().isEmpty().isLength({ min: 6 }).withMessage(i18n.__('must have 6 characters at least'))
];

// Objects exported by the module
module.exports = {
	queryValidations,
	bodyValidationsPost,
	bodyValidationsPut
};

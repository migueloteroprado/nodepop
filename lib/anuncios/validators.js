'use strict';

/**
 * This module exports an array of validators for GET, POST and PUT Requests for Anuncios
 */

// express validator
const { query, body } = require('express-validator/check');

// translations
const i18n = require('../i18nConfigure')();

// config
const { MAX_LIMIT }  = require('../config');

// List of posible tags
const tags = ['work', 'lifestyle', 'motor', 'mobile'];

/**
* Express-validator custom check functions
*/

// custom function for express-validator to validate tags
const checkTags = value => {
	// if there is only one tag, convert string to array
	let queryTags = typeof value === 'object' ? value : [value];
	// check tags
	queryTags.forEach(tag => {
		if (tag.length === 0 || tags.indexOf(tag) === -1) {
			throw new Error(`${i18n.__('wrong value')} ${tag}. ${i18n.__('Must be work, lifestyle, motor or mobile')}`);
		}
	});
	return true;
};
 
// custom function for express-validator to validate price
const checkPrice = value => {
	if (value && value.length > 0) {
		const parts = value.split('-');
		if (parts.length > 2) {
			throw new Error(i18n.__('wrong format'));
		}
		parts.forEach((part) => {
			if (isNaN(part)) {
				throw new Error(i18n.__('wrong format'));
			}
		});
	}
	return true;
};
 
// custom function for express-validator to validate foto
const checkFoto = value => {
	if (!value) {
		throw new Error('foto is required');
	}
	if (!value.match(new RegExp(/\.(gif|jpe?g|png)$/i))) {
		throw new Error(i18n.__('foto field must contain a .gif, .jpg, .jpeg or .png image file name'));
	}
	return true;
};
 
// Array of validations for querystring parameters in GET requests
// All parameters are optional, and check that they are not passed multiple times (not isArray), except for tags
const	queryValidations = [
	query('venta').optional({ checkFalsy: true }).not().isArray().isIn(['true', 'false']).withMessage(i18n.__('must be true or false')),
	query('tag').optional({ checkFalsy: true }).custom(checkTags),
	query('precio').optional({ checkFalsy: true }).not().isArray().custom(checkPrice),
	query('start').optional({ checkFalsy: true }).not().isArray().isInt().withMessage(i18n.__('must be a non-negative integer')),
	query('limit').optional({ checkFalsy: true }).not().isArray().isInt({max: MAX_LIMIT}).withMessage(`${i18n.__('must be integer')}, ${i18n.__('maximum')} ${MAX_LIMIT}`),
	query('sort').optional({ checkFalsy: true }).not().isArray()
];
 
// Array of validations for body object passed to POST requests
// check that they are not passed multiple times (not isArray)
const	bodyValidationsPost = [
	body('nombre').not().isArray().not().isEmpty().withMessage(i18n.__('is required')),
	body('venta').not().isArray().isIn(['true', 'false']).withMessage(i18n.__('must be true or false')),
	body('tags').not().isEmpty().custom(checkTags),
	body('precio').not().isArray().isFloat({min: 0.0}).withMessage(i18n.__('must be a positive number')),
	body('foto').custom(checkFoto)
];
 
// Array of validations for body object passed to PUT requests
const bodyValidationsPut = [
	body('nombre').optional().not().isArray().not().isEmpty().withMessage(i18n.__('is required')),
	body('venta').optional().not().isArray().isIn(['true', 'false']).withMessage(i18n.__('must be true or false')),
	body('tags').optional().custom(checkTags),
	body('precio').optional().not().isArray().isFloat({min: 0.0}).withMessage(i18n.__('must be a positive number')),
	body('foto').optional().custom(checkFoto)
];

// Objects exported by the module
module.exports = {
	queryValidations,
	bodyValidationsPost,	
	bodyValidationsPut
};

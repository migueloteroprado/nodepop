'use strict';

// express validator
const { query, body } = require('express-validator/check');

// List of posible tags
const tags = ['work', 'lifestyle', 'motor', 'mobile'];

// custom function for express-validator to validate tags
const checkTags = (value) => {
	// if there is only one tag, convert string to array
	let queryTags = typeof value === 'object' ? value : [value];
	// check tags
	queryTags.forEach(tag => {
		if (tag.length === 0 || tags.indexOf(tag) === -1) {
			throw new Error(`wrong value '${tag}'. Must be work, lifestyle, motor or mobile`);
		}
	});
	return true;
};

// custom function for express-validator to validate price
const checkPrice = (value) => {
	if (value && value.length > 0) {
		const parts = value.split('-');
		if (parts.length > 2) {
			throw new Error('wrong format');
		}
		parts.forEach((part) => {
			if (isNaN(part)) {
				throw new Error('wrong format');
			}
		});
	}
	return true;
};

module.exports = {
 
	// Method that returns a filters object created form querystring parameters, to pass to model list method
	// This method is invoked from the API and from the View
	getFilters: function(queryString) {
		// get filters from querystring
		const nombre = queryString.nombre;
		const tag = queryString.tag;
		const venta = queryString.venta;
		const precio = queryString.precio;

		// create empty filter
		let filters = {};

		// filter by name, obtaining all documents whose name starts by given value, case insensitive
		if (nombre) {
			filters.nombre = new RegExp('^' + nombre, 'i');
		}
		// filter by tag
		if (tag) {
			filters.tags = { $in: tag } ;
		}
		// filter by venta
		if (venta) {
			filters.venta = venta.toLowerCase() === 'true';
		}
		// filter by price
		if (precio) {
			const position = precio.indexOf('-');
			if (position === -1)	// No '-' character: one exact price
				filters.precio = parseFloat(precio);
			else if (position === 0)	// Begins with '-': maximum value
				filters.precio = { $lte: parseFloat(precio.substring(1, precio.length + 1)) } ;
			else if (position === precio.length - 1)	// Ends with '-': minimum value
				filters.precio = { $gte: parseFloat(precio.substring(0, precio.length)) } ;
			else {	// value range
				const precios = precio.split('-');
				filters.precio = { $gte: parseFloat(precios[0]), $lte: parseFloat(precios[1]) } ;
			}
		}
		return filters;
	},	

	// Array of validations for querystring parameters in GET requests
	// All parameters are optional, and check that they are not passed multiple times (not isArray)
	queryValidations: [
		query('venta').optional({ checkFalsy: true }).not().isArray().isIn(['true', 'false']).withMessage('must be true or false'),
		query('tag').optional({ checkFalsy: true }).custom(checkTags),
		query('precio').optional({ checkFalsy: true }).not().isArray().custom(checkPrice),
		query(['start', 'limit']).optional({ checkFalsy: true }).not().isArray().isInt().withMessage('must be integer'),
		query('sort').optional({ checkFalsy: true }).not().isArray()
	],

	// Array of validations for body object passed to POST requests
	// check that they are not passed multiple times (not isArray)
	bodyValidationsPost: [
		body('nombre').not().isArray().not().isEmpty().withMessage('is required'),
		body('venta').not().isArray().isIn(['true', 'false']).withMessage('must be true or false'),
		body('tags').not().isEmpty().custom(checkTags),
		body('precio').not().isArray().isFloat({min: 0.0}).withMessage('must be a positive number')/*,
		body('foto').not().isArray().isString().matches(new RegExp(/\.(gif|jpe?g|png)$/i)).withMessage('must be a .gif, .jpg, .jpeg or .png image file')*/
	],	

	// Array of validations for body object passed to PUT requests
	bodyValidationsPut: [
		body('nombre').optional().not().isArray().not().isEmpty().withMessage('is required'),
		body('venta').optional().not().isArray().isIn(['true', 'false']).withMessage('must be true or false'),
		body('tags').optional().custom(checkTags),
		body('precio').optional().not().isArray().isFloat({min: 0.0}).withMessage('must be a positive number')/*,
		body('foto').optional().not().isArray().matches(new RegExp(/\.(gif|jpe?g|png)$/i)).withMessage('must be an string containing a .gif, .jpg, .jpeg or .png image file name')*/
	]

};

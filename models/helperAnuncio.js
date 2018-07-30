// express validator
const query = require('express-validator/check').query;

// List of posible tags
const tags = ['work', 'lifestyle', 'motor', 'mobile'];

// custom function for express-validator to validate tags
let checkTags = (value) => {
	let queryTags = typeof value === 'object' ? value : [value];
	for (let i = 0; i < queryTags.length; i++) {
		if (tags.indexOf(queryTags[i]) === -1) {
			throw new Error(`wrong value '${queryTags[i]}'`);
		}
	}
	return true;
};

// custom function for express-validator to validate price
let checkPrice = (value) => {
	if (value.length > 0) {
		const parts = value.split('-');
		if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
			throw new Error('wrong format');
		}
	}
	return true;
};

// custom function for express-validator to validate integer values
let checkInteger = (value) => {
	if (!value)
		return true;
	if (isNaN(value))
		throw new Error('must be an integer');
	if (!Number.isInteger(parseFloat(value)))
		throw new Error('must be an integer');
	return true;
};

module.exports = {

	// validation array for querystring
	validations: [
		query('venta').optional().isIn(['', 'true', 'false']).withMessage('must be "true" or "false"'),
		query('tag').optional().custom(checkTags),
		query('precio').optional().custom(checkPrice),
		query('start').custom(checkInteger),
		query('limit').custom(checkInteger)
	],

	// obtain filter object from querystring
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
			if (position === -1) {
				filters.precio = parseInt(precio);
			}
			else if (position === 0) {
				filters.precio = { $lte: parseInt(precio.substring(1, precio.length+1)) } ;
			}
			else if (position === precio.length -1) {
				filters.precio = { $gte: parseInt(precio.substring(0, precio.length)) } ;
			}
			else {
				const precios = precio.split('-');
				filters.precio = { $gte: parseInt(precios[0]), $lte: parseInt(precios[1]) } ;
			}
		}

		return filters;
	}

};

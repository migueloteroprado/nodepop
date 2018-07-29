// express validator
const query = require('express-validator/check').query;

const tags = ['work', 'lifestyle','motor','mobile'];
const regExpPrecio = new RegExp('|(([0-9]+(.[0-9]+)?)|-([0-9]+(.[0-9]+)?)|([0-9]+(.[0-9]+)?)-|([0-9]+(.[0-9]+)?)-([0-9]+(.[0-9]+)?))$');

module.exports = {

	validations: [
		query('venta').optional().isIn(['', 'true', 'false']).withMessage('must be "true" or "false"'),
		query('tag').optional().isIn(['', ...tags]).withMessage('must be "work", "lifestyle", "motor" or "mobile"'),
		query('precio').optional().matches(regExpPrecio).withMessage('must be "(exact.price)", "(min.price)-", "-(max.price)" or "(min.price)-(max.price)"'),
		query('start').optional().isInt().withMessage('must be numeric'),
		query('limit').optional().isInt().withMessage('must be numeric')
	],

	getFilters: function(queryString) {

		// get filters from querystring
		const nombre = queryString.nombre;
		const tag = queryString.tag;
		const venta = queryString.venta;
		const precio = queryString.precio;

		// create empty filter
		const filters = {};
		
		// filter by name, obtaining all documents whose name starts by given value, case insensitive
		if (nombre) {
			filters.nombre = new RegExp('^' + nombre, 'i');
		}
		// filter by tag
		if (tag) {
			filters.tags = tag;
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

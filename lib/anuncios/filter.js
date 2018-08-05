'use strict';

/** 
 * This module exports a function that returns a filters object created form querystring parameters, to pass to model list method
 * This function is invoked from the API and from the listing web page
 */

module.exports = queryString => {

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
};
'use strict';

/** 
 * This module exports a function that returns a filters object created form querystring parameters, to pass to model list method
 */

module.exports = queryString => {

	// get filters from querystring
	const name = queryString.name;
	const email = queryString.email;
	const role = queryString.role;

	// create empty filter
	let filters = {};

	// filter by name, obtaining all users whose name begins with given value, case insensitive
	if (name) {
		filters.name = new RegExp(name, 'i');
	}
	if (email) {
		filters.email = new RegExp(email, 'i');
	}
	if (role) {
		filters.role = new RegExp(role, 'i');
	}

	return filters;
};

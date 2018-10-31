'use strict';

/**
 * Middleware to verify if a user is authenticated (has a session)
 * Verify if session has an _id, if not redirects to login page
 */

// const User = require('../../models/users/User');

module.exports = function() {
	return function(req, res, next)   {
		if (!req.session.authUser) {
			req.flash('error', res.__('You need to be logged to do that'));
			res.redirect('/login');
			return;
		}
		next();
	};
};

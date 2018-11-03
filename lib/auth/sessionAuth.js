'use strict';

/**
 * Middleware to verify if a user is authenticated (has a session)
 * Verify if session has an _id, if not redirects to login page
 */

const namedRoutes = require('../namedRoutes');

module.exports = function() {
	return function(req, res, next)   {
		if (!req.session.authUser) {
			req.flash('error', res.__('You need to be logged to do that'));
			res.redirect(namedRoutes.login);
			return;
		}
		next();
	};
};

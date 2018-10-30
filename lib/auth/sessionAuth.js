'use strict';

/**
 * Middleware to verifyif a user is authenticated (has a session)
 * Verify if session has an _id, if not redirects to login page
 */

const User = require('../../models/users/User');

module.exports = function() {
	return function(req, res, next)   {
		if (!req.session.authUser) {
			res.locals.error = '';
			res.redirect('/login');
			return;
		}
		next();
		// recuperamos el usuario y lo metemos en el req para que lo usen los demás middlewares.
		// Ojo, si no lo necesitamos o lo necesitamos en pocos métodos, mejor no meterlo
		/*
		User.findById(req.session.authUser._id).then(user => {
			req.user = user;
			next();
		});
		*/
    
	};
};
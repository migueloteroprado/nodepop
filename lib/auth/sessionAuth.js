'use strict';

/**
 * Middleware to verifyif a user is authenticated (has a session)
 * Verify if session has an _id, if not redirects to login page
 */

// const Usuario = require('../models/Usuario');

module.exports = function() {
	return function(req, res, next)   {
		if (!req.session.authUser) {
			res.redirect('/login');
			return;
		}
		return next();
		// recuperamos el usuario y lo metemos en el req para que lo usen los demás middlewares.
		// Ojo, si no lo necesitamos o lo necesitamos en pocos métodos, mejor no meterlo
		//Usuario.findById(req.session.authUser._id).then(usuario => {
		//	req.user = usuario;
		//	next();
		//});
    
	};
};
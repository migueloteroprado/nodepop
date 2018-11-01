'use strict';

const jwt = require('jsonwebtoken');

/**
  * Middleware to verify token
 */

module.exports = function() {

	return (req, res, next) => {

		// read token
		const token = req.body.token || req.query.token || req.get('x-access-token');
		if (!token) {
			const err = new Error('no token provided');
			next(err);
			return;
		}

		// verify token
		jwt.verify(token, process.env.AUTH_JWT_SECRET, (err, decoded) => {
			if (err) {
				next(err);
				return;
			}
			req.apiUserId = decoded._id;
			req.apiUserRole = decoded.role;

			next();

		});
	};
};
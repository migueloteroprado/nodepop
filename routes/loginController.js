'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users/User');

class loginController {
	
	// GET "/"
	index(req, res, next) {
		res.locals.title = 'Login';
		res.locals.email = process.env.NODE_ENV === 'development' 
			? 'user@example.com'
			: '';
		res.locals.error = '';
		res.render('login/login');
	}
	
	// Login for website
	async post(req, res, next) {
		// get email and password from request body
		const email = req.body.email;
		const password = req.body.password;

		try {

			// find user
			const user = await User.findOne({email: email}).exec();

			if (!user || !await bcrypt.compare(password, user.password)) {
				res.locals.email = email;
				res.locals.error = res.__('Invalid credentials');
				res.locals.title = 'Login';
				res.render('login/login');
				return;
			}

			// save user in a session
			req.session.authUser = { _id: user._id };

			res.redirect('/anuncios');

		} catch (err) {
			next(err);
		}

	}

	// Login for API
	async postJWT(req, res, next) {
		// get email and password from request body
		const email = req.body.email;
		const password = req.body.password;

		try {

			// find user
			const user = await User.findOne({email: email}).exec();

			if (!user || !await bcrypt.compare(password, user.password)) {
				res.json({ success: false, error: 'Invalid credentials' });
				return;
			}

			// usuario found and password is correct
			jwt.sign({ _id: user._id }, process.env.AUTH_JWT_SECRET, {
				expiresIn: '1h'
			}, (err, token) => {
				if (err) {
					next(err);
					return;
				}
				res.json({ success: true, token: token });
			});

		} catch (err) {
			next(err);
		}

	}  

	// GET /logout
	logout(req, res, next) {
		delete req.session.authUser; // delete authUser from session
		req.session.regenerate(function(err) { // delete session
			if (err) {
				next(err);
				return;
			}
			res.redirect('/');
		});
	}

}

module.exports = new loginController();

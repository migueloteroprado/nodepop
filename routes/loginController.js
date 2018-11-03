'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users/User');

const namedRoutes = require('../lib/namedRoutes');

class loginController {
	
	// GET "/"
	index(req, res, next) {
		res.locals.title = res.__('Login');
		res.locals.email = process.env.NODE_ENV === 'development' 
			? 'user@example.com'
			: '';
		res.locals.page = 'login';
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
				res.locals.title = res.__('Login');
				res.locals.page = 'login';

				req.flash('error', res.__('Invalid credentials'));
				
				res.render('login/login');
				return;
			}

			// save user in a session and redirect to /anuncios
			req.session.authUser = { _id: user._id, email: user.email, role: user.role };

			req.flash('success', res.__('Logged in successfully'));

			res.redirect(namedRoutes.ads);

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
			// set flash message and redirect to home page
			req.flash('success', res.__('Logged out successfully'));
			res.redirect(namedRoutes.home);
		});
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
				res.json({ success: false, error: res.__('Invalid credentials') });
				return;
			}

			// usuario found and password is correct
			jwt.sign({ _id: user._id, role: user.role }, process.env.AUTH_JWT_SECRET, {
				expiresIn: '2d'
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

}

module.exports = new loginController();

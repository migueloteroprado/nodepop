'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users/User');

class loginController {

	// Login for website
	async post(req, res, next) {
		// get email and password from request body
		const email = req.body.email;
		const password = req.body.password;

		try {

			// search user
			const user = await User.findOne({email: email}).exec();

			if (!user || !await bcrypt.compare(password, user.password)) {
				res.locals.error = res.__('Invalid credentials');
				res.render('login');
				return;
			}

			// save user in a session
			req.session.authUser = { _id: user._id };

			res.redirect('/');

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

			// buscar el usuario
			const user = await User.findOne({email: email}).exec();

			if (!user || !await bcrypt.compare(password, user.password)) {
				res.json({ success: false, error: 'Invalid credentials' });
				return;
			}

			// usuario encontrado y password ok
			// OJO: no meter instancias de mongoose en el token
			jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
				expiresIn: '5h'
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

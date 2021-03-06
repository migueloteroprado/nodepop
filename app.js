'use strict';

// Uncoomet this line if you want Logger to write file 'access.log'
// var fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override'); // allows send PUT and DELETE requests from HTML forms
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const flash = require('express-flash'); // Flash messages

const loginController = require('./routes/loginController');

const { isAPI } = require('./lib/utils');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

// Logger setup. Uncomment next line to enable logging to file 'access.log'
// app.use(logger('common', { stream: fs.createWriteStream('./access.log', {flags: 'a'}) }));
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method')); // send PUT and DELETE requests from forms
app.use(express.static(path.join(__dirname, 'public')));

// Flash messages
app.use(flash());

/**
 * Configuración Multiidioma
 */
const i18n = require('./lib/i18nConfigure')();
app.use(i18n.init);

// Variables globales de template
app.locals.app_name = 'Nodepop';

/**
 * Connect to database and register models
 */
require('./lib/connectMongoose');
require('./models/anuncios/Anuncio');

/**
 *  ROUTES
 */

/**
 * API routes
 */
app.post('/api/authenticate', loginController.postJWT);
app.use('/api/anuncios', require('./routes/api/anuncios'));
app.use('/api/users', require('./routes/api/users'));

/**
 * Init user session
 */
app.use(session({
	name: 'nodepop-session',
	secret: process.env.AUTH_SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: { 
		httpOnly: true, // cookie can't be read from javascript, only from http
		maxAge: 2 * 24 * 60 * 60 * 1000, // session expires in 2 days
		secure: false
	},
	store: new MongoStore({
		// store session in mongo database
		url: process.env.NODEPOP_MONGOOSE_CONNECTION_STRING
	})
}));

// auth helper middleware - gives us access to sesion from any view
app.use((req, res, next) => {
	res.locals.session = req.session;
	next();
});

/**
 * Web application routes
 */

// index page
app.use('/', require('./routes/index'));

// language route
app.use('/lang', require('./routes/lang'));

// user routes
app.get('/login', loginController.index);
app.post('/login', loginController.post);
app.get('/logout', loginController.logout);

// anuncios routes
app.use('/anuncios', require('./routes/anuncios'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {

	// Validation errors
	if (err.array) { // other errors never contain an array
		err.status = 422;
		const errorInfo = err.array({ onlyFirstError: true })[0];
		err.message = isAPI(req)
			? { message: res.__('Not valid'), errors: err.mapped() }
			: `Not valid - ${errorInfo.param} : ${errorInfo.msg}`;
	}
	// JWT errors, return status code 401 (unauthorized)
	if (err.message === 'no token provided' 
			|| err.message === 'invalid token'
			|| err.message == 'jwt expired'
			|| err.message === 'invalid signature') {
		err.status = 401;
	}
	res.status(err.status || 500);

	// if error comes from API, return a JSON object, otherwise render error page
	if (isAPI(req)) {
		res.json({ success: false, error: err.message });
		return;
	}

	// set locals, only providing error in development
	res.locals.title = 'Error';
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

	// render the error page
	res.render('error');
});

module.exports = app;

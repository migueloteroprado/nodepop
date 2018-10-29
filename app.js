'use strict';

// Uncoomet this line if you want Logger to write file 'access.log'
// var fs = require('fs');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const { isAPI } = require('./lib/utils');

const loginController = require('./routes/loginController');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

/**
 * Configuración Multiidioma
 */

const i18n = require('./lib/i18nConfigure')();
app.use(i18n.init);


// Logger setup. Uncomment next line to enable logging to file 'access.log'
// app.use(logger('common', { stream: fs.createWriteStream('./access.log', {flags: 'a'}) }));
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
app.use('/apiv1/anuncios', require('./routes/apiv1/anuncios'));
app.use('/apiv1/users', require('./routes/apiv1/users'));

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

// auth helper middleware - da accesso a sesión desde cualquier vista
app.use((req, res, next) => {
	res.locals.session = req.session;
	next();
});

/**
 * Web application routes
 */
// index page
app.use('/', require('./routes/index'));

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
			? { message: 'Not valid', errors: err.mapped() }
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
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

	// render the error page
	res.locals.title = 'Error';
	res.render('error');
});

module.exports = app;

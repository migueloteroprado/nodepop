'use strict';

// Uncoomet this line if you want Logger to write file 'access.log'
// var fs = require('fs');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { isAPI } = require('./lib/utils');

var app = express();

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
app.use(express.static(path.join(__dirname, 'public')));

// Variables globales de template
app.locals.title = 'Nodepop';

/**
 * Connect to database and register models
 */
require('./lib/connectMongoose');
require('./models/anuncios/Anuncio');

/**
 *  Routes
 */

/**
 * API routes
 */
app.use('/apiv1/anuncios', require('./routes/apiv1/anuncios'));
app.use('/apiv1/users', require('./routes/apiv1/users'));

/**
 * Web application routes
 */
app.use('/', require('./routes/index'));
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

	res.status(err.status || 500);

	// si el error es de una petición a la api, devolvemos un jason, no una página renderizada
	if (isAPI(req)) {
		res.json({ success: false, error: err.message });
		return;
	}

	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Variables globales de template
app.locals.title = 'Nodepop';


// Routes
app.use('/', require('./routes/index'));
app.use('/anuncios', require('./routes/anuncios'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res) {

	// Validation errors
	if (err.array) { // los errores 'normales' nunca tienen un array
		err.status = 422;
		const errorInfo = err.array({onlyFirstError: true})[0];
		err.message = `Not valid - ${errorInfo.param} ${errorInfo.msg}`;
	}
	
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

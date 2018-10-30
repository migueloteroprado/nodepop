'use strict';

const i18n = require('i18n');
const path = require('path');

module.exports = function() {
	i18n.configure({
		locales: ['en', 'es'],
		directory: path.join(__dirname, '..', 'locales'),
		defaultLocale: 'en',
		autoReload: true,
		syncFiles: true,
		cookie: 'nodepop-lang' // use locale from this cookie
	});

	i18n.setLocale('en'); // default locale for scripts

	return i18n;
};

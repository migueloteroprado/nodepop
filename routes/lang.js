'use strict';

const express = require('express');
const router = express.Router();

router.get('/:locale', (req, res, next) => {
	// recuperar el codigo del lenguaje que me piden
	const locale = req.params.locale;

	// guardar la página a la que hay que volver
	const backTo = req.get('referer');

	// establecemos la cookie del nuevo idioma
	res.cookie('nodepop-lang', locale, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 14 });

	// redirigimos al usuario a donde estaba
	res.redirect(backTo);

});

module.exports = router;

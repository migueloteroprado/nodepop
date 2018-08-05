'use strict';

/**
 * This module exports a multer object configured to upload an image file for field 'foto' of Anuncios
 */

const path = require('path');
const multer  = require('multer');

// multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../public/images/anuncios'));
	},
	filename: function (req, file, cb) {
		cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
	}
});

// multer uploader
module.exports = multer({
	storage: storage,
	fileFilter: function (req, file, cb) {
		// check file type
		const extension = (path.extname(file.originalname));
		if (!extension.match(/\.(jpg|jpeg|png|gif)$/)) {
			return cb(new Error('Only image files are allowed (jpeg, jpeg, png, gif)'));
		}
		// put filename to req.body, to save it in database
		req.body.foto = file.originalname;
		cb(null, true);
	}
});

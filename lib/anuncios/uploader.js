'use strict';

/**
 * This module exports a multer object configured to upload an image file for field 'foto' of Anuncios
 */

const path = require('path');
const multer  = require('multer');

// multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', '..', 'public', 'images', 'anuncios'));
	},
	filename: function (req, file, cb) {
		// Add field name and timestamp to original filename
		const fileName = `${file.fieldname}-${Date.now()}-${file.originalname}`;
		// add file name to the req.body, to save it to the database text field
		req.body[file.fieldname] = fileName;
		cb(null, fileName);
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
		cb(null, true);
	}
});

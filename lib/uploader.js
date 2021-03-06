'use strict';

/**
 * This module exports a multer object configured to upload an image file for field 'foto' of Anuncios
 */

const path = require('path');
const multer  = require('multer');

// translations
const i18n = require('./i18nConfigure')();

// returns a multer object with given destination folder
const uploader = (folder) => {

	// multer storage
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, folder);
		},
		filename: function (req, file, cb) {
			// Add field name and timestamp to original filename
			const fileName = `${file.fieldname}-${Date.now()}-${file.originalname}`;
			// add file name to the req.body, to save it to the database text field
			req.body[file.fieldname] = fileName;
			cb(null, fileName);
		}
	});

	return multer({
		storage: storage,
		fileFilter: function (req, file, cb) {
			// check file type
			const extension = (path.extname(file.originalname));
			if (!extension.match(/\.(jpg|jpeg|png|gif)$/)) {
				return cb(new Error(i18n.__('Only image files are allowed (jpeg, jpeg, png, gif)')));
			}
			cb(null, true);
		}
	});
};

module.exports = uploader;

'use strict';

const path = require('path');

const cote = require('cote');
const requester = new cote.Requester({ name: 'thumbnail generator client' }, { log:false });

const { ANUNCIOS_IMAGE_BASE_PATH }  = require('../config');

const generateThumbnail = function (req, cb) {
	// Invoke microservice to generate image thumbnail
	return requester.send({
		type: 'generate thumbnail',
		path: path.join(__dirname, '..', '..', 'public', ANUNCIOS_IMAGE_BASE_PATH),
		file: req.fileName,
		width: 100,
		height: 100
	}, (error, result) => {
		if (error) {
			cb(error, null);
			return;
		}
		cb(null, result);
	});
};

const deleteImage = function (req, cb) {
	// Invoke microservice to delete image and thumbnail(s)
	return requester.send({
		type: 'delete image',
		path: path.join(__dirname, '..', '..', 'public', ANUNCIOS_IMAGE_BASE_PATH),
		file: req.fileName
	}, (error, result) => {
		if (error) {
			cb(error, null);
			return;
		}
		cb(null, result);
	});
};

module.exports = {
	generateThumbnail,
	deleteImage
};

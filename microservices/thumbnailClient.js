'use strict';

const cote = require('cote');

const requester = new cote.Requester({ name: 'thumbnail generator client' }, { log:false });

const generateThumbnail = function (req, cb) {
	// Invoke microservice to generate image thumbnail
	return requester.send({
		type: 'generate thumbnail',
		file: req.fileName,
		width: req.width,
		height: req.height
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

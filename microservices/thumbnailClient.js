'use strict';

const cote = require('cote');

const requester = new cote.Requester({ name: 'thumbnail generator client' });

const generateThumbnail = function (req, cb) {
	// Invoke microservice to generate image thumbnail
	return requester.send({
		type: 'generate thumbnail',
		file: req.fileName,
		width: req.width,
		height: req.height
	}, (err, res) => {
		if (err) {
			return cb(err);
		}
		return cb(null, res);
	});
};

const deleteImage = function (req, cb) {
	// Invoke microservice to delete image and thumbnail(s)
	return requester.send({
		type: 'delete image',
		file: req.fileName
	}, (err, res) => {
		if (err) {
			return cb(err);
		}
		return cb(null, res);
	});
};

		
module.exports = {
	generateThumbnail,
	deleteImage
};

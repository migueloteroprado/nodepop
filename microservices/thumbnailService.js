'use strict';

const cote = require('cote');
const path = require('path');
const jimp = require('jimp');

// Thumbnail generation service

const responder = new cote.Responder({ name: 'thumbnail generator service' });

responder.on('generate thumbnail', async (req, done) => {
  
	console.log(`thumbnail generation -> ${req.file} - ${req.width}x${req.height} - ${Date.now()}`);
  
	// Generate thumbnail
	try {
		// read file
		const image = await jimp.read(path.join(__dirname, '..', 'public', 'images', 'anuncios', req.file));
		// generate thumbnail
		const resizedImage = await image
			.cover(Math.min(image.getWidth(), image.getHeight()), Math.min(image.getWidth(), image.getHeight()))
			.resize(req.width, req.height, jimp.AUTO)
			.writeAsync(path.join(__dirname, '..', 'public', 'images', 'anuncios', 'thumbs', `${req.width}x${req.height}-${req.file}`));
		// invoke done callback
		done(null, resizedImage);
	} catch (err) {
		// invoke callback with error
		done(err);
	}
});

module.exports = responder;

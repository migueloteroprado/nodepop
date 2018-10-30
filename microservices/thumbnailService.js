'use strict';

const cote = require('cote');
const path = require('path');
const fs = require('fs');
const jimp = require('jimp');

// Thumbnail generation service

const responder = new cote.Responder({ name: 'thumbnail generator service' });

// generate thumbnail message
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

// delete file message
responder.on('delete image', async (req, done) => {
	
	console.log(`delete image -> ${req.file}`);
	
	// Delete image
	try {

		// delete file
		fs.unlink(path.join(__dirname, '..', 'public', 'images', 'anuncios', req.file), (err) => {
			if (err) {
				done(err);
				return;
			}

			// delete thumbnails

			// read files in thumbs directory
			fs.readdir(path.join(__dirname, '..', 'public', 'images', 'anuncios', 'thumbs'), (err, files) => {
				if (err) {
					done(err);
					return;
				}
				// delete thumbnails of deleted image
				for (let i=0; i<files.length; i++) {
					if (files[i].indexOf(req.file) >= 0) {

						console.log(`delete thumb -> ${files[i]}`);

						fs.unlink(path.join(__dirname, '..', 'public', 'images', 'anuncios', 'thumbs', files[i]), (err) => {
							if (err) {
								console.log('ERR_DELETE_THUMB', err);
								done(err);
								return;
							}
						});
					}
				}
			});
			done(null);
		});
	
	} catch (err) {
		// invoke callback with error
		done(err);
	}
});


module.exports = responder;

'use strict';

const cote = require('cote');
const path = require('path');
const fs = require('fs');
const jimp = require('jimp');

// Thumbnail generation service

const responder = new cote.Responder({ name: 'thumbnail generator service' }, { log: false });

// generate thumbnail message
responder.on('generate thumbnail', async (req, done) => {
	
	console.log(`${Date.now()} - Thumbnail generation -> ${req.width}x${req.height}-${req.file}`);
	
	// Generate thumbnail
	try {
		// read file
		const image = await jimp.read(path.join(__dirname, '..', 'public', 'images', 'anuncios', req.file));
		// generate thumbnail
		const resizedImage = await image
			.cover(Math.min(image.getWidth(), image.getHeight()), Math.min(image.getWidth(), image.getHeight()))
			.resize(req.width, req.height, jimp.AUTO)
			.writeAsync(path.join(__dirname, '..', 'public', 'images', 'anuncios', 'thumbs', `${req.width}x${req.height}-${req.file}`));
		// OK, invoke done callback
		done(null, resizedImage);
	} catch (err) {
		console.error(`${Date.now()}: ${err.message}`);
		done(err, null);
	}
	
});

// delete file message
responder.on('delete image', async (req, done) => {
	
	console.log(`${Date.now()}: Delete image -> ${req.file}`);
	
	try {

		// Delete image file:
		fs.unlink(path.join(__dirname, '..', 'public', 'images', 'anuncios', req.file), (err) => {
			if (err) {
				done(err, null);
				return;
			}

			// Delete thumbnails:
			// read files in thumbs directory
			fs.readdir(path.join(__dirname, '..', 'public', 'images', 'anuncios', 'thumbs'), (err, files) => {
				if (err) {
					console.error(`${Date.now()}: ${err.message}`);
					done(err, null);
					return;
				}
				// delete all possible thumbnails of deleted image
				for (let i=0; i<files.length; i++) {
					if (files[i].indexOf(req.file) >= 0) {
						console.log(`${Date.now()}: Delete thumb -> ${files[i]}`);
						fs.unlink(path.join(__dirname, '..', 'public', 'images', 'anuncios', 'thumbs', files[i]), (err) => {
							if (err) {
								console.error(`${Date.now()}: ${err.message}`);
								done(err, null);
								return;
							}
						});
					}
				}
			});
			// OK
			done(null);
		});

	} catch (err) {
		// invoke callback with error
		console.error(`${Date.now()}: ${err.message}`);
		done(err, null);
	}
});

'use strict';

require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');
require('../lib/connectMongoose');
const Anuncio = require('./Anuncio');
const fs = require('fs');

// Function to read the file and return its content parsed as JSON
// The function returns a promise that will be resolved with the JSON object en case of success, or rejected returrning the error
function readJsonFile(file) {
	return new Promise((resolve, reject) => {
		fs.readFile('./anuncios.json', 'UTF-8', (err, datos) => {
			if (err) {
				reject(err);
			}
			let anuncios;
			try {
				anuncios = JSON.parse(datos);
			} catch(err) {
				reject(err);
			}
			resolve(anuncios.anuncios);
		});
	});
}

// Function to insert an array of documents in the database
async function insertDocuments(anuncios) {
	try {
		for (let i = 0; i < anuncios.length; i++) {
			const anuncio = new Anuncio(anuncios[i]);
			const anuncioSaved = await anuncio.save();
			console.log('DOCUMENT SAVED:', anuncioSaved);
		}
	} catch(err) {
		console.error('ERROR:', err);
		process.exit(1);
	}
}

readJsonFile('./anuncios.json')
	.then((anuncios) => {
		console.info('File successfully read and parsed...');
		insertDocuments(anuncios)
			.then(() => {
				console.log('Proccess finished succesfully');
				process.exit(0);
			})
			.catch((err) => {
				console.log(err);
			});
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});



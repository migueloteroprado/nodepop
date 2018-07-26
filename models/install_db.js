'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
require('../lib/connectMongoose');
const Anuncio = require('./Anuncio');
const fs = require('fs');

const fileName = './models/anuncios.json';

// Read the file and return its content parsed as JSON
// Function returns a promise:
// - if the file is read and parsed correctly, promise will be resolved with the parsed JSON object (an array of 'anuncios')
// - in case of error, promise will be rejected returrning the error
function readJsonFile(file) {
	return new Promise((resolve, reject) => {
		fs.readFile(file, 'UTF-8', (err, data) => {
			if (err) {
				reject('ERROR READING FILE:',err);
			}
			let obj;
			try {
				obj = JSON.parse(data);
				if (obj.anuncios) {
					resolve(obj.anuncios);
				} else {
					reject('ERROR PARSING JSON: Anuncios collection not found');
				}
			} catch(err) {
				reject(err);
			}
		});
	});
}

// inserts an array of documents in the database, using the model provided
async function insertDocuments(docs, model) {
	await model.insertMany(docs);
	return docs.length;
	/*
	let numRecords = 0;
	for (let i = 0; i < anuncios.length; i++) {
		const anuncio = new Anuncio(anuncios[i]);
		const anuncioSaved = await anuncio.save();
		numRecords++;
		console.log('DOCUMENT SAVED IN DATABASE:', anuncioSaved);
	}
	return numRecords;
	*/
}

// 1) Delete all documents in database collection 'anuncios'
// 2) Read json file and parse as JSON
// 3) Insert documents form parsed JSON into database
Anuncio.deleteAll()
	.then(() => {
		console.log(`All 'anuncios' deleted successfully`);
		return readJsonFile(fileName);		
	}) /*
	.then(() => {

	})*/
	.then((anuncios) => {
		console.info(`File '${fileName}' successfully read and parsed...`);
		return insertDocuments(anuncios, Anuncio);
	})
	.then((numRecords) => {
		console.info(`${numRecords} 'anuncios' were inserted on database`);
		console.info(`Proccess finished succesfully.`);
		mongoose.connection.close();
	})
	.catch((err) => {
		console.error(err);
		mongoose.connection.close();
	});

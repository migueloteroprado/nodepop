'use strict';

require('dotenv').config();

const readline = require('readline');
const mongoose = require('mongoose');
const conn = require('./lib/connectMongoose');
const Anuncio = require('./models/Anuncio');
const anuncios = require('./data/anuncios.json').anuncios;

conn.once('open', async() => {
	try {
		// ask user
		const response = await askUser('Are you sure you want to delete all database contents? (no) ')
		if (response.toLowerCase() !== 'yes') {
			console.log('Proccess Aborted.');
			proccess.exit(1);
		}

		// check json
		if (!anuncios) {
			console.info(`The json file doesn't contain any document`);
			process.exit(1);
		}

		// delete old anuncios and insert new ones from json file
		await initAnuncios(anuncios);

		// close database connection
		conn.close();
	} 
	catch (err) {
		console.error('ERROR:', err);
		process.exit(1);
	}
});

function askUser(question) {
	return new Promise((resolve, reject) => {
		// init readline interface with stdin and stdout
		const rl =  readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		// ask user
		rl.question(question, function(answer) {
			rl.close();
			resolve(answer);
		});
	});
}

async function initAnuncios(anuncios) {
	// Delete all documents from database
	const deleted = await Anuncio.deleteMany();
	console.log(`Removed ${deleted.n} anuncios.`);

	// Insert new documents from json file
	const inserted = await Anuncio.insertMany(anuncios);
	console.log(`Inserted ${inserted.length} anuncios.`)
}

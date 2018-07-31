'use strict';

require('dotenv').config();

const readline = require('readline');
const conn = require('./lib/connectMongoose');

const Anuncio = require('./models/anuncios/Anuncio');
const User = require('./models/users/User');

const anuncios = require('./data/anuncios.json').anuncios;
const users = require('./data/users.json').users;

conn.once('open', async() => {
	try {
		// ask user
		const response = await askUser('Are you sure you want to delete all database contents? (no) ')
		if (response.toLowerCase() !== 'yes') {
			console.log('Proccess Aborted.');
			process.exit(1);
		}

		// check json
		if (!anuncios) {
			console.info(`The json file 'anuncios.js' doesn't contain any document`);
			process.exit(1);
		}

		if (!users) {
			console.info(`The json file 'users.js' doesn't contain any document`);
			process.exit(1);
		}

		// delete old anuncios and insert new ones from json file
		await initAnuncios(anuncios);

		// delete old anuncios and insert new ones from json file
		await initUsers(users);

		// close database connection
		conn.close();
		process.exit();
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

async function initUsers(users) {
	// Delete all users from database
	const deleted = await User.deleteMany();
	console.log(`Removed ${deleted.n} users.`);

	// Insert new users from json file
	const inserted = await User.insertMany(users);
	console.log(`Inserted ${inserted.length} users.`)
}

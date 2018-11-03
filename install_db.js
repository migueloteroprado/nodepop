'use strict';

require('dotenv').config();

const readline = require('readline');
const conn = require('./lib/connectMongoose');

const Anuncio = require('./models/anuncios/Anuncio');
const User = require('./models/users/User');

const anuncios = require('./data/anuncios.json').anuncios;
const users = require('./data/users.json').users;

const { generateThumbnail } = require('./lib/anuncios/thumbnailRequester');

conn.once('open', async() => {
	try {
		// ask user
		const response = await askUser('Are you sure you want to delete all database contents? (no) ');
		if (response.toLowerCase() !== 'yes') {
			console.log('Proccess Aborted.');
			process.exit(1);
		}

		// check json
		if (!anuncios) {
			console.log('The json file anuncios.js has no documents');
			process.exit(1);
		}

		if (!users) {
			console.log('The json file users.js has no users');
			process.exit(1);
		}

		// delete old users and insert new ones from json file
		await initUsers(users);

		// delete old anuncios and insert new ones from json file
		await initAnuncios(anuncios);


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

async function initUsers(users) {
	// Delete all users from database
	const deleted = await User.deleteMany();
	console.log(`Removed ${deleted.n} users.`);

	// hash passwords
	for (let i=0; i<users.length; i++) {
		users[i].password = await User.hashPassword(users[i].password);
	}

	// Insert new users from json file
	const inserted = await User.insertMany(users);
	console.log(`Inserted ${inserted.length} users.`);
}

async function initAnuncios(anuncios) {
	// replace user email for user id in every anuncio
	for (let i=0; i<anuncios.length; i++) {
		const user = await User.findOne({ email: anuncios[i].user });
		if (user) {
			anuncios[i].user = user._id;
		} else {
			anuncios[i].user = null;
		}

	}
	// Delete all documents from database
	const deleted = await Anuncio.deleteMany();
	console.log(`Removed ${deleted.n} anuncios.`);

	// Insert new documents from json file
	const inserted = await Anuncio.insertMany(anuncios);
	console.log(`Inserted ${inserted.length} anuncios.`);

	// Generate thumbnails
	for (let i=0; i<anuncios.length; i++) {
		generateThumbnail({
			fileName: anuncios[i].foto, 
			width: 100,
			height: 100
		}, (error) => {
			if (error) {
				console.log('Error generating thumbnail: ', error);
				return;
			}
			console.log('Thumbnail succesfully generated');
		});
	}	
}



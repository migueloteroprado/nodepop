'use strict';

const mongoose = require('mongoose');

const conn = mongoose.connection;

conn.on('error', err => {
	console.error('Database Connection Error:', err);
	process.exit(1);
});

conn.once('open', () => {
	console.log('Conected to MongoDB on', conn.name);
});

mongoose.connect(process.env.NODEPOP_MONGOOSE_CONNECTION_STRING, {useNewUrlParser: true});

module.exports = conn;
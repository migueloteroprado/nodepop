'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema
const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		index: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true,
		default: 'user',
		index: true
	}
});

// If an indexing error occurs, exit app with error code
userSchema.on('index', function(error) {
	console.error(error);
	process.exit(1);
});

// static method to get users filtered, sorted and paginated
userSchema.statics.list = function(filter, limit, start, sort) {
	const query = User.find(filter);
	query.limit(limit);
	query.skip(start);	
	query.select('name email role');
	query.sort(sort).collation({ locale: 'es', caseLevel: true }); // collation with caseLevel:true to perform case insensitive sorting 
	return query.exec();
};

// Static method to get document count
userSchema.statics.count = function(filters) {
	const query = User.countDocuments(filters);
	return query.exec();
};


userSchema.statics.hashPassword = async function(plainPassword) {
	// returns a promise with hashed password
	return bcrypt.hash(plainPassword, 10);
};

// Create model
const User = mongoose.model('User', userSchema);

module.exports = User;

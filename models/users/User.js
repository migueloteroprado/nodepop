'use strict';

const mongoose = require('mongoose');
	
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
	}
});

// If an indexing error occurs, exit app with error code
userSchema.on('index', function(error) {
	console.log(error);
	process.exit(1);
});

// static method to get users filtered, sorted and paginated
userSchema.statics.list = function(filter, limit, start, sort) {
	const query = User.find(filter);
	query.limit(limit);
	query.skip(start);	
	query.select('name email');
	query.sort(sort).collation({ locale: 'es', caseLevel: true }); // collation with caseLevel:true to perform case insensitive sorting 
	return query.exec();
};

// Create model
const User = mongoose.model('User', userSchema);

module.exports = User;

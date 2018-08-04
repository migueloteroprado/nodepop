'use strict';

const mongoose = require('mongoose');

// Schema definition
// Create indexes for fields: nombre, venta, precio and tags
const anuncioSchema = mongoose.Schema({
	nombre: {
		type: String,
		required: true,
		index: true
	},
	venta: {
		type: Boolean,
		required: true,
		default: true,
		index: true
	},
	precio: {
		type: Number,
		min: 0,
		required: true,
		index: true
	},
	tags: {
		type: [String],
		required: true,
		index: true
	},
	foto: {
		type: String,
		required: true
	}
});

// If an indexing error occurs, exit app with error code
anuncioSchema.on('index', function(error) {
	console.error(error);
	process.exit(1);
});

// Static method for filtered, paginated and sorted search
anuncioSchema.statics.list = function(filters, limit, start, fields, sort) {
	const query = Anuncio.find(filters);
	query.limit(limit);
	query.skip(start);	
	query.select(fields);
	query.sort(sort).collation({ locale: 'es', caseLevel: true }); // collation with caseLevel:true to perform case insensitive sorting
	return query.exec();
};

// Static method to get document count
anuncioSchema.statics.count = function(filters) {
	const query = Anuncio.countDocuments(filters);
	return query.exec();
};

// Create model
const Anuncio = mongoose.model('Anuncio', anuncioSchema);

module.exports = Anuncio;
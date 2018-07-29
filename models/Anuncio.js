var mongoose = require('mongoose');

const anuncioSchema = mongoose.Schema({
	nombre: {
		type: String,
		required: true
	},
	venta: {
		type: Boolean,
		default: true
	},
	precio: {
		type: Number,
		min: 0
	},
	foto: String,
	tags: [String]
});

anuncioSchema.statics.list = function(filters, limit, start, fields, sort) {
	const query = Anuncio.find(filters);
	query.limit(limit);
	query.skip(start);	
	query.select(fields);
	query.sort(sort);
	return query.exec();
};

anuncioSchema.statics.count = function(filters) {
	const query = Anuncio.countDocuments(filters);
	return query.exec();
};

const Anuncio = mongoose.model('Anuncio', anuncioSchema);

module.exports = Anuncio;

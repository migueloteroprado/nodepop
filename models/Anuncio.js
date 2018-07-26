var mongoose = require('mongoose');

const anuncioSchema = mongoose.Schema({
	nombre: String,
	venta: Boolean,
	precio: Number,
	foto: String,
	tags: [String]
});

anuncioSchema.statics.deleteAll = async function () {
	return await this.deleteMany().exec();
};

const Anuncio = mongoose.model('Anuncio', anuncioSchema);


module.exports = Anuncio;

// multer instance to upload image files
const path = require('path');
const multer  = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../public/images/anuncios'));
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	}
});

const upload = multer({storage: storage});

module.exports = upload;

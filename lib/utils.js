'use strict';

module.exports.isAPI = function (req) {
	return req.originalUrl.indexOf('/api') === 0;
};

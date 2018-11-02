'use strict';

module.exports = {
	apps : [
		{
			name: 'Nodepop',
			script: './bin/www',
			instances: 1,
			autorestart: true,
			watch: false,
			output: './logs/nodepop.log',
			error: './logs/nodepop.error.log',
			max_memory_restart: '1G',
		},
		{
			name: 'ThumbnailService',
			script: './microservices/thumbnailService.js',
			instances: 1,
			autorestart: true,
			watch: false,
			output: './logs/thumnailService.log',
			error: './logs/thumnailService.error.log',
			max_memory_restart: '1G',
		}
	]
};

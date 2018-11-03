/* eslint-disable no-undef */
'use strict';

require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const { expect } = require('chai');

// Hide stacktrace on errors
Error.stackTraceLimit = 0;

/**
 *  Authentication
**/

describe('POST /api/authenticate', function() {

	// Authenticate with invalid credentials returns: 200 { success: false, error: 'Invalid credentials' }
	it('Returns 200 for invalid credentials { success: false, error: "Invalid credentials" }', function(done) {
		const user = {
			email: 'user@example.com',
			password: 'wrong'
		};
		request(app)
			.post('/api/authenticate')
			.send(user)
			.expect('Content-Type', /json/)
			.expect(200, {
				success: false,
				error: 'Invalid credentials'
			}, done);
	});

	// Authenticate with valid credentials returns: 200 - { success: true, token: '(valid token)' }
	it('Returns auth token, for valid credentials', function(done) {
		const user = {
			email: 'user@example.com',
			password: '1234'
		};
		request(app)
			.post('/api/authenticate')
			.send(user)
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.be.a('string');
			})
			.expect(200, done);
	});
	
}); 

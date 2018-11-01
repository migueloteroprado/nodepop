/* eslint-disable no-undef */
'use strict';

require('dotenv').config();
const request = require('supertest');
const app = require('../app');

// Hide stacktrace on errors
Error.stackTraceLimit = 0;

/**
 *  Authentication
**/

// Authenticate with invalid credentials returns: 200 { success: false, error: 'Invalid credentials' }
describe('POST /api/authenticate', function() {
	const user = {
		email: 'user@example.com',
		password: 'wrong'
	};
	it('Returns 200 for invalid credentials { success: false, error: "Invalid credentials" }', function(done) {
		request(app)
			.post('/api/authenticate')
			.send(user)
			.expect('Content-Type', /json/)
			.expect(200, {
				success: false,
				error: 'Invalid credentials'
			}, done);
	});
}); 

// Save auth token for future tests
let token = null;

// Authenticate with valid credentials returns: 200 - { success: true, token: '(valid token)' }
describe('POST /api/authenticate', function() {
	const user = {
		email: 'user@example.com',
		password: '1234'
	};
	it('Returns auth token, for valid credentials', function(done) {
		request(app)
			.post('/api/authenticate')
			.send(user)
			.expect('Content-Type', /json/)
			.expect(200)
			.expect(function(res) {
				if (res.body.token) {
					token = res.body.token;
					res.body.token = 'token';
				}
			})
			.expect(200, {
				success: true,
				token: 'token'
			}, done);
	});
}); 

/**
 * Anuncios 
**/

// check requests with no token returns 401 error { success: false, error: 'no token provided' }
describe('GET /api/anuncios', function() {
	it('Returns 401 (no token provided) for requests without token', function(done) {
		request(app)
			.get('/api/anuncios')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(401, {
				success: false,
				error: 'no token provided'
			},done);	
	});
}); 

// check requests with malformed tokens returns: 500 { success: false, error: 'jwt malformed' }
describe('GET /api/anuncios', function() {
	it('Returns 500 (jwt malformed) for requests with malformed token', function(done) {
		request(app)
			.get('/api/anuncios')
			.set('Accept', 'application/json')
			.send({ token: 'this is a malformed token' })
			.expect('Content-Type', /json/)
			.expect(500, {
				success: false,
				error: 'jwt malformed'
			},done);	
	});
}); 

// check requests with invalid tokens returns: 401 { success: false, error: 'invalid token' }
describe('GET /api/anuncios', function() {
	it('Returns 401 error for requests with invalid token', function(done) {
		request(app)
			.get('/api/anuncios')
			.set('Accept', 'application/json')
			.send({ token: 'header.payload.signature' })
			.expect('Content-Type', /json/)
			.expect(401, {
				success: false,
				error: 'invalid token'
			},done);	
	});
}); 

// check requests with expired tokens returns: 401 { success: false, error: 'jwt expired' }
describe('GET /api/anuncios', function() {
	it('Returns 401 error for requests with expired token', function(done) {
		request(app)
			.get('/api/anuncios')
			.set('Accept', 'application/json')
			.send({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ4NjVjZGFlMTM4MDI0YjI4ZjFmYTUiLCJyb2xlIjoidXNlciIsImlhdCI6MTU0MDkwOTE3NywiZXhwIjoxNTQwOTEyNzc3fQ.07Z2DzB0dIpy-dcC5zY_Gh38XP8Am-fbZxCGFwKAKRM' })
			.expect('Content-Type', /json/)
			.expect(401, {
				success: false,
				error: 'jwt expired'
			},done);	
	});
}); 

// check requests with valid token returns a list of anuncios
describe('GET /api/anuncios', function() {
	it('Returns a list of ads for requests with valid token', function(done) {
		request(app)
			.get('/api/anuncios')
			.set('Accept', 'application/json')
			.send({ token: token })
			.expect('Content-Type', /json/)
      .expect(200)
      .expect(function(result) {
        expect(result.success.toBe(true));
      }, done);
	});
}); 





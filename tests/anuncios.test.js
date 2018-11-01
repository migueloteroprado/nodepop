/* eslint-disable no-undef */
'use strict';

require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const path = require('path');

// Hide stacktrace on errors
Error.stackTraceLimit = 0;

const checkAdFields = function(ad) {
	if (!ad.hasOwnProperty('nombre')) 
		return new Error('Returned Ad should have a \'nombre\' property');
	if (!ad.hasOwnProperty('venta')) 
		return new Error('Returned Ad should have a \'venta\' property');
	if (!ad.hasOwnProperty('precio')) 
		return new Error('Returned Ad should have a \'precio\' property');
	if (!ad.hasOwnProperty('tags')) 
		return new Error('Returned Ad should have a \'tags\' property');
	if (!ad.hasOwnProperty('foto')) 
		return new Error('Returned Ad should have a \'foto\' property');
	if (!ad.hasOwnProperty('user')) 
		return new Error('Returned Ad should have a \'user\' property');
	return null;
};

// Save auth token for next tests
let token = null;

// Authenticate to get a JWT token
describe('POST /api/authenticate', function() {
	it('Returns 401 (no token provided) for requests without token', function(done) {
		const user = {
			email: 'user@example.com',
			password: '1234'
		};
		request(app)
			.post('/api/authenticate')
			.send(user)
			.expect(function(res) {
				if (res.body.success && res.body.token) {
					token = res.body.token;
				}
			})
			.expect(200, done);
	});
});

/**
 * Ads
**/

describe('GET /api/anuncios', function() {

	// check requests with no token returns 401 error { success: false, error: 'no token provided' }
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

	// check requests with malformed tokens returns: 500 { success: false, error: 'jwt malformed' }
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

	// check requests with invalid tokens returns: 401 { success: false, error: 'invalid token' }
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

	// check requests with expired tokens returns: 401 { success: false, error: 'jwt expired' }
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

	// check GET /api/anuncios requests with valid token returns a list of Ads
	it('Returns a list of ads for requests with valid token', function(done) {
		request(app)
			.get('/api/anuncios')
			.set('Accept', 'application/json')
			.set('x-access-token', token)
			.expect('Content-Type', /json/)
			.expect(function(res) {
				if (!res.body.success) {
					throw new Error('success should be true');
				}
				if (!Array.isArray(res.body.result)) {
					throw new Error('result should be an array');
				}
				if (res.body.result.length > 0) {
					const ad = res.body.result[0];
					const err = checkAdFields(ad);
					if (err)
						throw err;
				}
			})
			.expect(200, done);
	});
}); 

// save created Ad for next tests
let ad = null;

describe('POST /api/anuncios', function() {

	// check POST /api/anuncios, whithout JWT token returns a 401 error
	it('Returns 401 error if no jwt token is passed', function(done) {
		request(app)
			.post('/api/anuncios')
			.set('Accept', 'application/json')
			.set('Content-Type', 'multipart/form-data')
			.expect('Content-Type', /json/)
			.expect(401, done);
	});

	// check POST /api/anuncios, passing a valid token without required fields returns 422 code, with all validation errors
	it('Returns validation errors when not all field values are passed', function(done) {
		request(app)
			.post('/api/anuncios')
			.set('Accept', 'application/json')
			.set('Content-Type', 'multipart/form-data')
			.set('x-access-token', token)
			.field('venta', false)
			.expect('Content-Type', /json/)
			.expect(422, {
				'success': false,
				'error': {
					'message': 'Not valid',
					'errors': {
						'nombre': {
							'location': 'body',
							'param': 'nombre',
							'msg': 'is required'
						},
						'tags': {
							'location': 'body',
							'param': 'tags',
							'msg': 'Invalid value'
						},
						'precio': {
							'location': 'body',
							'param': 'precio',
							'msg': 'must be a positive number'
						},
						'foto': {
							'location': 'body',
							'param': 'foto',
							'msg': 'foto is required'
						}
					}
				}
			}, done);
	});

	// check POST /api/anuncios, passing a valid token and all required fields without validation errors
	it('Inserts new Ad', function(done) {
		request(app)
			.post('/api/anuncios')
			.set('Accept', 'application/json')
			.set('Content-Type', 'multipart/form-data')
			.set('x-access-token', token)
			.field('nombre', 'Test Ad')
			.field('venta', false)
			.field('precio', 123.45)
			.field('tags', ['lifestyle', 'mobile'])
			.attach('foto', path.join(__dirname, '..', 'public', 'images', 'portada.jpg'))
			.expect('Content-Type', /json/)
			.expect(function(res) {
				if (!res.body.success) {
					throw new Error('success should be true');
				}
				if (!res.body.result) {
					throw new Error('response should have a result value');
				}
				ad = res.body.result;
				const err = checkAdFields(ad);
				if (err) {
					throw err;
				}
			})
			.expect(200, done);
	});
});

// check PUT /api/anuncios, passing a valid token and updated field values, returns code 200, with { success: true, result: { (updated Ad) }}
describe('PUT /api/anuncios/:id', function() {
	it('Updates Ad', function(done) {
		request(app)
			.put(`/api/anuncios/${ad._id}`)
			.set('Accept', 'application/json')
			.set('Content-Type', 'multipart/form-data')
			.set('x-access-token', token)
			.field('nombre', 'Test Ad Updated')
			.field('venta', true)
			.expect('Content-Type', /json/)
			.expect(function(res) {
				if (!res.body.success) {
					throw new Error('success should be true');
				}
				if (!res.body.result) {
					throw new Error('response should have a result value');
				}
				ad = res.body.result;
				const err = checkAdFields(ad);
				if (err) {
					throw err;
				}
			})
			.expect(200, done);
	});
});

// check DELETE /api/anuncios/:id, passing a valid token and updated field values, returns code 200 with { success: true, result: { deleted: 1 } }
describe('PUT /api/anuncios/:id', function() {
	it('Deletes Ad', function(done) {
		request(app)
			.delete(`/api/anuncios/${ad._id}`)
			.set('Accept', 'application/json')
			.set('x-access-token', token)
			.expect('Content-Type', /json/)
			.expect(200, {
				'sucess': true,
				'result': {
					'deleted': 1
				}
			}, done);
	});
});

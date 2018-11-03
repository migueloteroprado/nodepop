/* eslint-disable no-undef */
'use strict';

require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const { expect } = require('chai');
const path = require('path');

// Hide stacktrace on errors
Error.stackTraceLimit = 0;

const checkAdFields = function(ad) {
	expect(ad).has.ownProperty('nombre');
	expect(ad).has.ownProperty('venta');
	expect(ad).has.ownProperty('precio');
	expect(ad).has.ownProperty('tags');
	expect(ad).has.ownProperty('foto');
	expect(ad).has.ownProperty('user');
};

// Save auth token for next tests
let token = null;

// save created Ad for next tests
let ad = null;

// Authenticate to get a JWT token
describe('POST /api/authenticate', function() {
	it('Returns auth token, for valid credentials', function(done) {
		const user = {
			email: 'user@example.com',
			password: '1234'
		};
		request(app)
			.post('/api/authenticate')
			.send(user)
			.expect(function(res) {
				expect(res.body.success).to.equal(true);
				expect(res.body.token).to.be.a('string');
				// save token for next tests
				token = res.body.token;
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

	// check GET /api/anuncios requests with valid token returns a list of Ads
	it('Returns a list of ads for requests with valid token', function(done) {
		request(app)
			.get('/api/anuncios')
			.set('Accept', 'application/json')
			.set('x-access-token', token)
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(res.body.success).to.equal(true);
				expect(res.body.result).to.be.an('array');
				if (res.body.result.length > 0) {
					checkAdFields(res.body.result[0]);
				}
			})
			.expect(200, done);
	});
}); 

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
				expect(res.body.success).to.equal(true);
				ad = res.body.result;
				expect(ad).to.be.an('object');
				checkAdFields(ad);
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
				expect(res.body.success).to.equal(true);
				ad = res.body.result;
				expect(ad).to.be.an('object');
				checkAdFields(ad);
			})
			.expect(200, done);
	});
});

// check DELETE /api/anuncios/:id, passing a valid token and updated field values, returns code 200 with { success: true, result: { deleted: 1 } }
describe('DELETE /api/anuncios/:id', function() {
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

describe('GET /api/anuncios/tags', function() {

	// check GET /api/anuncios/tags requests with valid token returns a list of available tags
	it('Returns a list of available tags for requests with valid token', function(done) {
		request(app)
			.get('/api/anuncios/tags')
			.set('Accept', 'application/json')
			.set('x-access-token', token)
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(res.body.success).to.equal(true);
				expect(res.body.result).to.be.an('array');
			})
			.expect(200, done);
	});
}); 

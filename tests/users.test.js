/* eslint-disable no-undef */
'use strict';

require('dotenv').config();
const app = require('../app');
const request = require('supertest');
const { expect } = require('chai');

// Hide stacktrace on errors
Error.stackTraceLimit = 0;

const checkUserFields = function(ad) {
	expect(ad).has.ownProperty('name');
	expect(ad).has.ownProperty('email');
	expect(ad).has.ownProperty('role');
};

// Save auth token for next tests
let token = null;

// save created User for next tests
let user = null;

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
			token = res.body.token;
		})
		.expect(200, done);
});

/**
 * Users
**/

describe('GET /api/users', function() {

	// check requests with no token returns 401 error { success: false, error: 'no token provided' }
	it('Returns 401 (no token provided) for requests without token', function(done) {
		request(app)
			.get('/api/users')
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
			.get('/api/users')
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
			.get('/api/users')
			.set('Accept', 'application/json')
			.send({ token: 'header.payload.signature' })
			.expect('Content-Type', /json/)
			.expect(401, {
				success: false,
				error: 'invalid token'
			},done);	
	});

	// check GET /api/users requests with valid token returns a list of Users
	it('Returns a list of users for requests with valid token', function(done) {
		request(app)
			.get('/api/users')
			.set('Accept', 'application/json')
			.set('x-access-token', token)
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(res.body.success).to.equal(true);
				expect(res.body.result).to.be.an('array');
				if (res.body.result.length > 0) {
					checkUserFields(res.body.result[0]);
				}
			})
			.expect(200, done);
	});
}); 

describe('POST /api/users', function() {

	// check POST /api/users, whithout JWT token returns a 401 error
	it('Returns 401 error if no jwt token is passed', function(done) {
		request(app)
			.post('/api/users')
			.set('Accept', 'application/json')
			.set('Content-Type', 'multipart/form-data')
			.expect('Content-Type', /json/)
			.expect(401, done);
	});

	// check POST /api/users, passing a valid token without required fields returns 422 code, with all validation errors
	it('Returns validation errors when not all field values are passed', function(done) {
		request(app)
			.post('/api/users')
			.set('Accept', 'application/json')
			.set('x-access-token', token)
			.send({ email: 'testuser@example.com' })
			.expect('Content-Type', /json/)
			.expect(422, {
				'success': false,
				'error': {
					'message': 'Not valid',
					'errors': {
						'name': {
							'location': 'body',
							'param': 'name',
							'msg': 'is required'
						},
						'password': {
							'location': 'body',
							'param': 'password',
							'msg': 'Invalid value'
						},
						'role': {
							'location': 'body',
							'param': 'role',
							'msg': 'is required'
						}
					}
				}
			}, done);
	});

	// check POST /api/users, passing a valid token and all required fields without validation errors
	it('Inserts new User', function(done) {
		request(app)
			.post('/api/users')
			.set('Accept', 'application/json')
			.set('x-access-token', token)
			.send({
				name: 'Test User',
				email: 'testuser@example.com',
				password: 'testuser',
				role: 'user' 
			})
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(res.body.success).to.equal(true);
				user = res.body.result;
				expect(user).to.be.an('object');
				checkUserFields(user);
			})
			.expect(200, done);
	});
});

// check PUT /api/users, passing a valid token and updated field values, returns code 200, with { success: true, result: { (updated User) }}
describe('PUT /api/users/:id', function() {
	it('Updates User', function(done) {
		request(app)
			.put(`/api/users/${user._id}`)
			.set('Accept', 'application/json')
			.set('Content-Type', 'multipart/form-data')
			.set('x-access-token', token)
			.field('name', 'Test User Updated')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				expect(res.body.success).to.equal(true);
				user = res.body.result;
				expect(user).to.be.an('object');
				checkUserFields(user);
			})
			.expect(200, done);
	});
});

// check DELETE /api/users/:id, passing a valid token and updated field values, returns code 200 with { success: true, result: { deleted: 1 } }
describe('DELETE /api/users/:id', function() {
	it('Deletes User', function(done) {
		request(app)
			.delete(`/api/users/${user._id}`)
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


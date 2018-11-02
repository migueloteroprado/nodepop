/* eslint-disable no-undef */
'use strict';

require('dotenv').config();
const app = require('../app');
const request = require('supertest');

// Hide stacktrace on errors
Error.stackTraceLimit = 0;

const checkUserFields = function(user) {
	if (!user.hasOwnProperty('name')) 
		return new Error('Returned User should have a \'name\' property');
	if (!user.hasOwnProperty('email')) 
		return new Error('Returned User should have a \'email\' property');
	if (!user.hasOwnProperty('role')) 
		return new Error('Returned User should have a \'role\' property');
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

	// check requests with expired tokens returns: 401 { success: false, error: 'jwt expired' }
	it('Returns 401 error for requests with expired token', function(done) {
		request(app)
			.get('/api/users')
			.set('Accept', 'application/json')
			.send({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ4NjVjZGFlMTM4MDI0YjI4ZjFmYTUiLCJyb2xlIjoidXNlciIsImlhdCI6MTU0MDkwOTE3NywiZXhwIjoxNTQwOTEyNzc3fQ.07Z2DzB0dIpy-dcC5zY_Gh38XP8Am-fbZxCGFwKAKRM' })
			.expect('Content-Type', /json/)
			.expect(401, {
				success: false,
				error: 'jwt expired'
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
				if (!res.body.success) {
					throw new Error('success should be true');
				}
				if (!Array.isArray(res.body.result)) {
					throw new Error('result should be an array');
				}
				if (res.body.result.length > 0) {
					const user = res.body.result[0];
					const err = checkUserFields(user);
					if (err)
						throw err;
				}
			})
			.expect(200, done);
	});
}); 

// save created User for next tests
let user = null;

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
				if (!res.body.success) {
					throw new Error('success should be true');
				}
				if (!res.body.result) {
					throw new Error('response should have a result value');
				}
				user = res.body.result;
				const err = checkUserFields(user);
				if (err) {
					throw err;
				}
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
				if (!res.body.success) {
					throw new Error('success should be true');
				}
				if (!res.body.result) {
					throw new Error('response should have a result value');
				}
				user = res.body.result;
				const err = checkUserFields(user);
				if (err) {
					throw err;
				}
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


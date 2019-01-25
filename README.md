![Nodepop Logo](doc/nodepop.png)

---

# Index

<pre>
0. DevOps
1. Install
2. Run
3. Tests
4. Lint
5. Usage
    5.1. API Operations
        5.1.1. Authenticate Endpoint
        5.1.2. Ads Endpoints
        5.1.3. Users Endpoints
    5.2. Web Site
</pre>

---

# 0. DevOps

The Application is deployed in an AWS EC2 instance:

* IP Address: **[63.34.128.111](http://63.34.128.111)**
* Nodepop Domain URL: **https://nodepop.miguelotero.net**

#### Nginx

**[Nginx](https://www.nginx.com/)** is configured as web server and reverse proxy for Nodepop app. 

SSL certificates from [Let's Encrypt](https://letsencrypt.org/) are installed for all subdomains, and all HTTP requests will be redirected to HTTPS, using http 2.0.

The following servers are configured on Nginx:
- Default server: will load a static bootstrap template page.
- nodepop.miguelotero.net: Nodepop app will be shown.
- miguelotero.net, www.miguelotero.net, curriculum.miguelotero.net: will show my curriculum vitae page.

#### PM2
**[PM2](https://pm2.io)** is installed to ensure that Node apps are always running, and is configured to start apps on server startup.

![pm2 status](doc/pm2-status.png)
![pm2 monit](doc/pm2-monit.png)

---

# 1. Install

Open a shell, got to app root folder and execute command:

``` shell
npm install
```

All modules required will be downloaded and installed.

### Configure Port, Database URL, and secret keys for Session and JWT Auth

1. Copy file "*.env.example*" to "*.env*"
2. In "*.env*" file, configure Port, in environment variable "NODEPOP_PORT"
Default value is 3000.
3. In "*.env*" file, configure MongoDB Database URL, in environment variable "NODEPOP_MONGOOSE_CONNECTION_STRING"
Default value is "mongodb://localhost:27017/nodepop"
4. In "*.env*" file, configure your secret keys for AUTH_SESSION_SECRET and AUTH_JWT_SECRET

### Initialize database

Use command:

``` shell
npm run install_db
```

**WARNING**: all previous database content will be deleted !!
You'll be prompted to confirm operation, enter 'yes' to confirm.

**NOTE**: For generating thumbnails of the ads photos added to database, the thumbnail generation microservice
should be running, see next section...

---

# 2. Run

### 1. From command line

#### Thumbnail Microservice

To start the thumbnail generation microservice, run in a shell:

``` shell
npm run service
```

#### Application
To start the application in **production** use:

``` shell
npm start
```

To run the application in **development** use:

``` shell
npm run dev
```

### 2. Using PM2

##### 1 - Install PM2 process manager, globally:

``` shell
npm install -g pm2
```

(In Mac or Linux, you may need execute command with root privileges, using "sudo".
In windows systems, you'll need execute the command from a console with administrator privileges)

##### 2 - Run all processess 

* To execute all proccesses configured: 

``` shell
pm2 start ecosystem.config.js
```
Process configuration can be modified on file 'ecosystem.config.js'

* To list running processes:

``` shell
pm2 list
```

* To monitorize running processes execute:

``` shell
pm2 monit
```

* To start/stop/restart all processes:

``` shell
pm2 [start/stop/restart] all
```

* To start/stop/restart one specific process:

``` shell
pm2 [start/stop/restart] [id/app_name]
```

---

# 3. Tests

To run application tests, execute:

``` shell
npm run test
```

# 4. Lint

To run eslint code validations, execute the command:

``` shell
npm run eslint
```

---

# 5. Usage

The app provides:
* A REST API to make operations with Ads and Users
* A web site with:
	- Landing page
	- Login page
	- List of Ads, filtered, sorted and paginated.
	The user authenticated will de able to edit or remove the ads created by he, or any ad if the user has the admin role
	- New Ad, if logged in
	- Edit Ad, if logged in

## 5.1. API Operations:

## 5.1.1. Authenticate Endpoint

### POST /api/authenticate

Uses to get a JWT token for use in later requests to the API

The request body must include a valid user email and password.

In case of invalid credentials, a JSON object will be returned, containing the error 'Invalid credentials'

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

In case of valid credentials, a token will be returned, for use in future requests

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmRkYmVhMGVjN2Q4YjJkOWU2MzQ4MzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDEyNjEyNzksImV4cCI6MTU0MTQzNDA3OX0.vnlGW_t7yqM0YCtY3I40Gt8mASIkyEBGIoWzbit7zRs"
}
```

For all other requests to API, 'token' must be passed in query string, body, or request header (as 'x-access-token'), otherwise an authentication error wil be returned:

```json
{
  "success": false,
  "error": "no token provided" / "invalid token" / "jwt malformed"
}
```

---

## 5.1.2. Ads Endpoints

### GET /api/anuncios

Get a listing of Ads.

A valid JWT auth token must be passed, as described previously.

Optional Parameters in query string:

Filters:

- **nombre**:
Filter documents whose name begins by parameter value, case insensitive
- **venta**:
Its value must be 'true' or 'false' (true: article in sell, false: article searched)
- **precio**:
Filter by price (sell price, or amount that the user would be willing to pay )
It can be:
	- Exact price.
	Example: '50'
	- Minimum price: Price followed by a '-' character
	Example: '100-'
	- Maximum price: A '-' character follew by maximum price
	Example: '-120.5'
	- Price Range: minimum and maximum prices separated by '-'
	Example: '50-230.7'
- **tag**:
Filter by article tag. Must be one of: 'work', 'motor', 'lifestyle', 'mobile'.
More than one tag parameter can be specified to create an array of tags.
Documents that have any of tags introduced will be returned.

Pagination:

- **start**: 
Number of documents to skip
- **limit**: 
Maximum number of documentes to return, maximum 100

Sort:

- **sort**
List of fields to order the results, separated by space.
To specify descending order, insert a '-' character before the field name.
Example: 'nombre -precio' will order results by nombre ascending and by precio descending.


Fields:

- **fields**:
List of fields to include or exclude, separated by space.
To exclude one field, it must have a '-' character before the field name.
Mixing inclussions and exclussions is not possible.
Possible fields are: _id, nombre, venta, precio, tags and foto.

##### Returns

Returns a JSON object with the following fields:
- success: Boolean value indicating if operation was succesfully executed, 
- result: 
	- If success: An array of all ads matching the filters specified.
	- If error: an object describing the error(s)

##### Examples

URL: http://localhost:3000/api/anuncios?nombre=bici&venta=true&tag=motor&tag=lifestyle&precio=150-&start=0&limit=3&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmRkYmVhMGVjN2Q4YjJkOWU2MzQ4MzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDEyNjE1ODAsImV4cCI6MTU0MTQzNDM4MH0.zJ4QbhtgmcItJ2ebWDcxzxqkNyN7RKYmbxH5XryNFJY

``` json
{
	"success": true,
	"result": [
		{
			"venta": true,
			"tags": [
				"lifestyle",
				"motor"
			],
			"_id": "5bddbea0ec7d8b2d9e63483b",
			"nombre": "Bicicleta",
			"precio": 230.15,
			"foto": "/images/anuncios/bici.jpg",
			"user": "5bddbea0ec7d8b2d9e634837",
			"__v": 0
		},
		{
			"venta": true,
			"tags": [
				"lifestyle",
				"motor"
			],
			"_id": "5bddbea0ec7d8b2d9e63483c",
			"nombre": "Bicicleta de montaña",
			"precio": 625,
			"foto": "/images/anuncios/bici-montaña.jpg",
			"user": "5bddbea0ec7d8b2d9e634837",
			"__v": 0
		}
	]
}
```
URL: http://localhost:3000/api/anuncios?&venta=idontknow&tag=any&tag=lifestyle&precio=abc&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmRkYmVhMGVjN2Q4YjJkOWU2MzQ4MzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDEyNjE1ODAsImV4cCI6MTU0MTQzNDM4MH0.zJ4QbhtgmcItJ2ebWDcxzxqkNyN7RKYmbxH5XryNFJY

``` json
{
"success": false,
	"error": {
		"message": "Not valid",
		"errors": {
			"venta": {
				"location": "query",
				"param": "venta",
				"value": "idontknow",
				"msg": "must be true or false"
			},
			"tag": {
				"location": "query",
				"param": "tag",
				"value": [
					"any",
					"lifestyle"
				],
				"msg": "wrong value 'any'. Must be work, lifestyle, motor or mobile"
			},
			"precio": {
				"location": "query",
				"param": "precio",
				"value": "abc",
				"msg": "wrong format"
			}
		}
	}
}
```

### GET /api/anuncios/tags

Obtain a list with the distinct tag values found in all the ads in database.

A valid JWT auth token must be passed, as described previously.

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: 
	- If sucess: An array containing all the tags existing in all ads.
	- If error: An object describing the error(s)

``` json
{
	"success": true,
	"result": [
		"lifestyle",
		"mobile",
		"motor",
		"work"
	]
}
```

### POST /api/anuncios

Inserts a new Ad document in database

A valid JWT auth token must be passed, as described previously.

##### Parameters

The request body must have an object with all of the following fields:

- **nombre**:
The name of the article. Cannot be empty.
- **venta**
true: the article is in sale
false: the article is searched
- **precio**:
Must be a Number.
Indicates the sell price if venta = true, or the price the user is willing to pay if venta = false
- **tag**:
At least one of the following: 'work', 'lifestyle', 'motor', 'mobile'
To pass more than one tag, insert multiple tag parameters with every value, to create an array of tags.
- **foto**:
An image file.
Must be a .jpg, .jpeg, .png or .gif file
The file will be uploaded to the server in the folder '/images/anuncios'. The name of the field ('foto' and a timestamp will be added as a prefix of the original file name.
The name of the uploaded file will be saved in the database.
A thumbnail with size size 100x100 pixels will be generated in folder '/images/anuncios/thumbs' (if thumbnail generation microservice is running).

The user passed in the auth JWT token will be added as Ad author.

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: 
	- If sucess: the new document inserted in database.
	- If error: an object describing the error(s).

##### Example
``` json
{
    "success": true,
    "result": {
        "venta": false,
        "tags": [
            "mobile",
            "lifestyle"
        ],
        "_id": "5b643d43ffe63a4172e7c486",
        "nombre": "Google Pixel 2",
        "precio": 755.5,
        "foto": "foto-1533341231478-google-pixel2.png",
        "user": "5bddbea0ec7d8b2d9e634837",
        "__v": 0
    }
}
```

### PUT /api/anuncios/:id

Updates the Ad with the given ID in the URL parameter 'id'. It must be a MongoDB ID.

A valid JWT auth token must be passed, as described previously.

The request body will receive an object with the fields to update:

- **nombre**:
The name of the article. If passed, cannot be empty.
- **venta**
true: the article is in sale.
false: the article is searched.
- **precio**:
If passed, it must be a Number.
Indicates the sell price if venta = true, or the price the user is willing to pay if venta = false.
- **tag**:
If passed, must be one or more of the following: 'work', 'lifestyle', 'motor', 'mobile'.
- **foto**:
An image file.
Must be a .jpg, .jpeg, .png or .gif file
The file entered will be uploaded to the server in the folder '/images/anuncios'.
The name of the file will be saved in the database.
If a new image is passed, the old image and thumbnails will de deleted, and a new one will be generated by thumbnail generation microservice (if running).

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: the document updated in database.

##### Example

URL: http://localhost:3000/api/anuncios/5b64394592661e4117f1da51?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ5ZjlhNTZiZmViODEzMzU0YTI2ZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDExMDI5NTUsImV4cCI6MTU0MTExMDE1NX0.9HK8IwxmtC2En5Lbb1J9izr5WeV3DMoB4zA9S7ypgxo

``` json
{
    "success": true,
    "result": {
        "venta": true,
        "tags": [
            "lifestyle",
            "motor"
        ],
        "_id": "5bddcd0c985cda5126ab1b56",
        "nombre": "Modificado",
        "precio": 123.45,
        "foto": "foto-1533341231478-bici-montaña.jpg",
        "user": "5bddbea0ec7d8b2d9e634837",
        "__v": 0
    }
}
```

URL: http://localhost:3000/api/anuncios/123456789?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ5ZjlhNTZiZmViODEzMzU0YTI2ZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDExMDI5NTUsImV4cCI6MTU0MTExMDE1NX0.9HK8IwxmtC2En5Lbb1J9izr5WeV3DMoB4zA9S7ypgxo

```json
{
    "success": false,
    "error": {
        "message": "Not valid",
        "errors": {
            "id": {
                "location": "params",
                "param": "id",
                "value": "123456789",
                "msg": "invalid ID"
            }
        }
    }
}
```

### DELETE /api/anuncios/:id

Deletes the Ad with the received ID in the URL parameter.
It must be a MongoDB ID.

A valid JWT auth token must be passed, as described previously.

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: an object with a 'deleted' indicating the numbre of documentes deleted from database.

##### Example

URL: http://localhost:3000/api/anuncios/5b643d43ffe63a4172e7c486A?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ5ZjlhNTZiZmViODEzMzU0YTI2ZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDExMDI5NTUsImV4cCI6MTU0MTExMDE1NX0.9HK8IwxmtC2En5Lbb1J9izr5WeV3DMoB4zA9S7ypgxo

``` json
{
    "sucess": true,
    "result": {
        "deleted": 1
    }
}
```

---

## 5.1.3. Users Endpoints

### GET /api/users

Get a listing of users.

A valid JWT auth token must be passed, as described previously.

Optional Parameters in query string:

Filters:

- **name**:
Filter documents whose name contains the text passed in parameter value, case insensitive.
- **email**:
Filter documents whose email contains the text passed in parameter value, case insensitive.
- **role**:
Filter documents whose role contains the text passed in parameter value, case insensitive.

Pagination:

- **start**: 
Number of documents to skip
- **limit**: 
Maximum number of documentes to return, maximum 100

Sort:

- **sort**
List of fields to order the results, separated by space.
To specify descending order, insert a '-' character before the field name.
Example: 'name -email' will order results by name ascending and then by email descending.


##### Returns

Returns a JSON object with the following fields:
- success: Boolean value indicating if operation was succesfully executed, 
- result: 
	- If success: An array of all users matching the filters specified.
	- If error: an object describing the error(s)

##### Example

URL: http://localhost:3000/api/users?name=ser&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ5ZjlhNTZiZmViODEzMzU0YTI2ZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDExMDI5NTUsImV4cCI6MTU0MTExMDE1NX0.9HK8IwxmtC2En5Lbb1J9izr5WeV3DMoB4zA9S7ypgxo

``` json
{
    "success": true,
    "result": [
        {
            "role": "admin",
            "_id": "5bddbea0ec7d8b2d9e634837",
            "name": "User1",
            "email": "user@example.com"
        },
        {
            "role": "user",
            "_id": "5bddbea0ec7d8b2d9e634838",
            "name": "User2",
            "email": "user2@example.com"
        },
        {
            "role": "user",
            "_id": "5bddbea0ec7d8b2d9e634839",
            "name": "User3",
            "email": "user3@example.com"
        }
    ]
}
```

### POST /api/users

Inserts a new user in database

##### Parameters

The request body must have an object with all of the following fields:

- **name**:
User's name. 
Cannot be empty.
- **email**
User's email. 
Cannot be empty and must be unique, there can't be two users with the same email.
- **password**:
User's password. 
Cannot be empty, and must be at least 6 characters long.
- **role**:
User role: 'admin' or 'user'

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: 
	- If sucess: the new user inserted in database.
	- If error: an object describing the error(s).

##### Examples
``` json
{
    "success": true,
    "result": {
        "role": "user",
        "_id": "5bddd332c2b3196a0fda0bae",
        "email": "testuser@example.com",
        "name": "Test User",
        "password": "$2b$10$z0gjEgRcod4zcQg/XYFrJO1felN3fqLfRt7GumOi4eS0Jznsb4dKm",
        "__v": 0
    }
}
```

``` json
{
    "success": false,
    "error": {
        "message": "Not valid",
        "errors": {
            "password": {
                "location": "body",
                "param": "password",
                "value": "12345",
                "msg": "must have 6 characters at least"
            }
        }
    }
}
```

``` json
{
    "success": false,
    "error": "Email already in use"
}
```

### PUT /api/users/:id

Updates the user with the given ID in the URL parameter 'id'. It must be a MongoDB ID

The request body will receive an object with the fields to update:

- **name**:
User's name. 
If passed, cannot be empty.
- **email**
User's email. 
If passed, cannot be empty and must be unique, there can't be two users with the same email.
- **password**:
User's password. 
If passed, cannot be empty, and must be at least 6 characters long.
- **role**:
User's password. 
If passed, cannot be empty.

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: the user updated in database.

##### Example

URL: http://localhost:3000/api/users/5b646a026ce8d7349efb61da&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ5ZjlhNTZiZmViODEzMzU0YTI2ZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDExMDI5NTUsImV4cCI6MTU0MTExMDE1NX0.9HK8IwxmtC2En5Lbb1J9izr5WeV3DMoB4zA9S7ypgxo

``` json
{
    "success": true,
    "result": {
        "role": "user",
        "_id": "5bddd332c2b3196a0fda0bae",
        "email": "updateduser@example.com",
        "name": "Updated User",
        "password": "$2b$10$z0gjEgRcod4zcQg/XYFrJO1felN3fqLfRt7GumOi4eS0Jznsb4dKm",
        "__v": 0
    }
}
```

### DELETE /api/users/:id

Deletes the user with the received ID in the URL parameter.
It must be a MongoDB ID

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: an object with a 'deleted' indicating the numbre of documentes deleted from database.

##### Example

URL: http://localhost:3000/api/anuncios/5b646a026ce8d7349efb61da&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ5ZjlhNTZiZmViODEzMzU0YTI2ZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDExMDI5NTUsImV4cCI6MTU0MTExMDE1NX0.9HK8IwxmtC2En5Lbb1J9izr5WeV3DMoB4zA9S7ypgxo

``` json
{
    "sucess": true,
    "result": {
        "deleted": 1
    }
}
```

URL: http://localhost:3000/api/users/bad-id&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmQ5ZjlhNTZiZmViODEzMzU0YTI2ZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1NDExMDI5NTUsImV4cCI6MTU0MTExMDE1NX0.9HK8IwxmtC2En5Lbb1J9izr5WeV3DMoB4zA9S7ypgxo

```json
{
    "success": false,
    "error": {
        "message": "Not valid",
        "errors": {
            "id": {
                "location": "params",
                "param": "id",
                "value": "bad-id",
                "msg": "invalid ID"
            }
        }
    }
}
```
---

## 5.2. Web Site

All pages have a Language selector in the right side of the header.
Available languages are Engilsh (EN) and Spanish (ES).
A language cookie will be set in the browser, with a validity of two weeks.

### Routes

### /

Site Home Page

![Home Page](doc/home.png)

### /login

Displays a login form, with email and password fields

![Login Page](doc/login.png)

### /anuncios

Displays a page with:
* A form to enter search filters and parameters
* A List of Ads, paginated 

An example screen capture is showed:

![List of Ads](doc/anuncios.png)

Clicking on an Ad photo will show a popup window with the image in full size.

Every Ad will have a "Edit" and "Delete" buttons, if:
- The logged in user is the Ad author.
- The logged in user has an 'admin' role.


We can pass to this page the same optional parameters as in "GET /" route of the API (/api/anuncios):

Filters:

- **nombre**:
Filter documents whose name begins by parameter value, case insensitive
- **venta**:
Its value must be 'true' or 'false' (true: article in sell, false: article searched)
- **precio**:
Filter by price (sell price, or amount that the user would be willing to pay )
It can be:
	- Exact price.
	Example: '50'
	- Minimum price: Price followed by a '-' character
	Example: '100-'
	- Maximum price: A '-' character follew by maximum price
	Example: '-120.5'
	- Price Range: minimum and maximum prices separated by '-'
	Example: '50-230.7'
- **tag**:
Filter by article tag. Must be one of: 'work', 'motor', 'lifestyle', 'mobile'.
More than one tag parameter can be specified to create an array of tags.
Documents that have any of tags introduced will be returned.

Pagination:

- **start**: 
Number of documents to skip
- **limit**: 
Maximum number of documentes to return, maximum 100

Sort:

- **sort**
List of fields to order the results, separated by space.
To specify descending order, insert a '-' character before the field name.
Example: 'nombre -precio' will order results by nombre ascending and by precio descending.


Fields:

- **fields**:
List of fields to include or exclude, separated by space.
To exclude one field, it must have a '-' character before the field name.
Mixing inclussions and exclussions is not possible.
Possible fields are: _id, nombre, venta, precio, tags and foto.

### /anuncios/new

This page will be only available to authenticated users.

Shows a form to add a new Ad.

![New Ad](doc/new-ad.png)

### /anuncios/:id/edit

This page will be only available to authenticated users.

Shows a form to edit an existing Ad.

![Edit Ad](doc/edit-add.png)

# BONUS TRACK

Create and publish a npm module:

https://www.npmjs.com/package/loan-calculus

It's a little function for calculating fee and amortization table for a loan, given an amount, interest, and number of months.

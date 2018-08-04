![Nodepop Logo](doc/nodepop.png)

---

# Install


Open a shell, got to app root folder and execute command:

``` shell
npm install
```

All modules required will be downloaded and installed.

### Configure Port

1. Copy file *.env.example* to *.env*
2. Edit *.env* file to configure environment variable "PORT" (default 3000).

### Configure Database

#### Set Database URL

1. Edit *.env* file to configure environment variable "MONGOOSE_CONNECTION_STRING".

#### Initialize database

Use command:

``` shell
npm run install_db
```

**WARNING**: all previous database content will be deleted !!
You'll be prompted to confirm operation, enter 'yes' to confirm.

---

# Run

To start the application in **production** use:

``` shell
npm start
```

To run the application in **development** use:

``` shell
npm run dev
```

---

# Lint

To run eslint validations, execute the command:

``` shell
npm run eslint
```

---

# Usage

The app provides:
* A REST API to make operations with anuncios and users
* A web site with a landing page and a listing of anuncios, filtered, sorted and paginated.

## API Operations:

## Anuncios

### GET /apiv1/anuncios

Get a listing of anuncios.

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
	- If success: An array of all anuncios matching the filters specified.
	- If error: an object describing the error(s)

##### Examples

URL: http://localhost:3000/apiv1/anuncios?nombre=bici&venta=true&tag=motor&tag=lifestyle&precio=150-&start=0&limit=3

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
			"_id": "5b64394592661e4117f1da4f",
			"nombre": "Bicicleta",
			"precio": 230.15,
			"foto": "bici.jpg",
			"__v": 0
		},
		{
			"venta": true,
			"tags": [
				"lifestyle",
				"motor"
			],
			"_id": "5b64394592661e4117f1da51",
			"nombre": "Bicicleta de montaña",
			"precio": 625,
			"foto": "bici-montaña.jpg",
			"__v": 0
		}
	]
}
```
URL: http://localhost:3000/apiv1/anuncios?&venta=idontknow&tag=any&tag=lifestyle&precio=abc

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

### GET /apiv1/anuncios/tags

Obtain a list with the distinct tag values found in all the anuncios in database

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: 
	- If sucess: An array containing all the tags existing in all anuncios.
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

### POST /apiv1/anuncios

Inserts a new Anuncio document in database

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
The file will be uploaded to the server in the folder /images/anuncios. A timestamp will be added to the file name.
The name of the file will be saved in the database.

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
        "foto": "google-pixel2.png",
        "__v": 0
    }
}
```

### PUT /apiv1/anuncios/:id

Updates the Anuncio with the given ID in the URL parameter 'id'. It must be a MongoDB ID

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
The file entered will be uploaded to the server in the folder /images/anuncios.
The name of the file will be saved in the database.

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: the document updated in database.

##### Example

URL: http://localhost:3000/apiv1/anuncios/5b64394592661e4117f1da51

``` json
{
    "success": true,
    "result": {
        "venta": false,
        "tags": [
            "lifestyle",
            "motor"
        ],
        "_id": "5b64394592661e4117f1da51",
        "nombre": "Bicicleta de montaña modificada",
        "precio": 575,
        "foto": "bici-montaña.jpg",
        "__v": 0
    }
}
```

URL: http://localhost:3000/apiv1/anuncios/123456789

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

### DELETE /apiv1/anuncios/:id

Deletes the Anuncio with the received ID in the URL parameter.
It must be a MongoDB ID

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: an object with a 'deleted' indicating the numbre of documentes deleted from database.

##### Example

URL: http://localhost:3000/apiv1/anuncios/5b643d43ffe63a4172e7c486

``` json
{
    "sucess": true,
    "result": {
        "deleted": 1
    }
}
```

## Users

### GET /users

Get a listing of users.

Optional Parameters in query string:

Filters:

- **name**:
Filter documents whose name contains the text passed in parameter value, case insensitive.
- **email**:
Filter documents whose email contains the text passed in parameter value, case insensitive.

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

URL: http://localhost:3000/apiv1/users?name=ser

``` json
{
	"success": true,
	"result": [
		{
			"_id": "5b64394592661e4117f1da60",
			"name": "User1",
			"email": "user1@nodepop.com",
			"__v": 0
		},
		{
			"_id": "5b64394592661e4117f1da61",
			"name": "User2",
			"email": "user2@nodepop.com",
			"__v": 0
		}
	]
}
```

### POST /apiv1/users

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
        "_id": "5b646a026ce8d7349efb61da",
        "name": "Juan",
        "email": "juan@nodepop.com",
        "password": "25565456445",
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

### PUT /apiv1/user/:id

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

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: the user updated in database.

##### Example

URL: http://localhost:3000/apiv1/users/5b646a026ce8d7349efb61da

``` json
{
    "success": true,
    "result": {
        "_id": "5b646a026ce8d7349efb61da",
        "name": "Miguel Otero",
        "email": "anotheruser@nodepop.com",
        "password": "123456",
        "__v": 0
    }
}
```

### DELETE /apiv1/anuncios/:id

Deletes the user with the received ID in the URL parameter.
It must be a MongoDB ID

##### Returns

An object with:
- success: Boolean value indicating if operation was succesfully executed, 
- result: an object with a 'deleted' indicating the numbre of documentes deleted from database.

##### Example

URL: http://localhost:3000/apiv1/anuncios/5b646a026ce8d7349efb61da

``` json
{
    "sucess": true,
    "result": {
        "deleted": 1
    }
}
```

URL: http://localhost:3000/apiv1/users/bad-id

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

## Web Site

### /

Site Home Page

### /anuncios

Displays a page with:
* A form to enter search filters and parameters
* A List of anuncios, paginated 

An example screen capture is showed:

![Nodepop Logo](doc/anuncios.png)

We can pass to this page the same optional parameters as in "GET /" route of the API (/apiv1/anuncios):

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

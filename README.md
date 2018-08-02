![Nodepop Logo](nodepop.png)

## Install

Open a shell, got to app root folder and execute command:

``` shell
npm install
```

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

## Run

To start the application in **production** use:

``` shell
npm start
```

To run the application in **development** use:

``` shell
npm run dev
```

---

## Lint

To configure eslint validations, edit file *.eslintrc.js* and configure rules
To execute eslint validations, execute:

``` shell
npm run eslint
```

---

## Usage

The app provides an REST API with the following routes:

#### GET /apiv1/anuncios

Get a listing of anuncios.

Optional Parameters in query string:
- **nombre**:
Will filter documents whose name begins by parameter value, case insensitive
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
More than one tag parameter can be specified, filtering documents that have any of them.
- **start**: 
Number of documents to skip
- **limit**: 
Maximum number of documentes to return, maximum 100
- **fields**:
List of fields to include or exclude, separated by space.
To exclude one field, it must have a '-' character before the field name.
Mixing inclussions and exclussions is not possible.
Possible fields are: _id, nombre, venta, precio, tags and foto.


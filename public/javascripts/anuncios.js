'use strict';

// Maximum number allowed for 'limit' parameter
const MAX_LIMIT = 100;

class Anuncios {

	constructor() {

		// get querystring params
		const params = this.getParams(window.location.href);

		this.nombre = params.nombre;
		let tag = params.tag;
		if (tag && typeof tag === 'string')
			tag = [tag];
		this.tag = tag;
		this.venta = params.venta;
		this.precio = params.precio;
		this.sort = params.sort;
		this.start = params.start;
		this.limit = params.limit;
		this.fields = params.fields;

		// DOM objects
		this.searchForm = document.querySelector('.search-form');
		this.inputNombre = document.querySelector('#nombre');
		this.checkWork = document.querySelector('#tag-work');
		this.checkLifestyle = document.querySelector('#tag-lifestyle');
		this.checkMotor = document.querySelector('#tag-motor');
		this.checkMobile = document.querySelector('#tag-mobile');

		this.selectVenta = document.querySelector('#venta');
		this.inputPrecio = document.querySelector('#precio');
		this.inputOrden = document.querySelector('#sort');

		this.inputStart = document.querySelector('#start');
		this.inputLimit = document.querySelector('#limit');

		this.inputFields = document.querySelector('#fields');

		// Add maximun value attribute to 'limit' input
		this.inputLimit.setAttribute('max', MAX_LIMIT);

		// intialize form values
		this.inputNombre.value = this.nombre ? this.nombre : '';
		
		this.checkWork.checked = this.tag && this.tag.indexOf('work') >= 0;
		this.checkLifestyle.checked = this.tag && this.tag.indexOf('lifestyle') >= 0;
		this.checkMotor.checked = this.tag && this.tag.indexOf('motor') >= 0;
		this.checkMobile.checked = tag && tag.indexOf('mobile') >= 0;

		this.selectVenta.value = this.venta ? this.venta : '';
		this.inputPrecio.value = this.precio ? this.precio : '';
		this.inputOrden.value = this.sort ? this.sort : '';

		this.inputStart.value = this.start ? this.start : '';
		this.inputLimit.value = this.limit ? this.limit : '';

		this.inputFields.value = this.fields ? this.fields : '';

	}

	// returns an objects with all the params extracted from the querystring
	getParams(url) {
		let params = {};
		let parser = document.createElement('a');
		parser.href = url;
		const query = parser.search.substring(1);
		const vars = query.split('&');
		for (let i = 0; i < vars.length; i++) {
			const pair = vars[i].split('=');
			if (!params[pair[0]])
				params[pair[0]] = decodeURIComponent(pair[1]);
			else {
				if (typeof params[pair[0]] === 'object')
					params[pair[0]].push(decodeURIComponent(pair[1]));
				else
					params[pair[0]] = [ params[pair[0]], decodeURIComponent(pair[1])];
			}
		}
		if (params.sort) params.sort = params.sort.replace(/\+/g,' ');
		if (params.fields) params.fields = params.fields.replace(/\+/g,' ');

		return params;
	}
}

const doesFileExist = (urlToFile) => {
	var xhr = new XMLHttpRequest();
	xhr.open('HEAD', urlToFile, false);
	xhr.send();
	if (xhr.status == '404') {
		return false;
	} else {
		return true;
	}
};

// Wait for DOM loaded
window.addEventListener('load', () => {
	new Anuncios();
});

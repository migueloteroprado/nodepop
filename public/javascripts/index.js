
export class Index {

	constructor() {

		// get querystring params
		const nombre = this.getParameterByName('nombre');
		const tag = this.getParameterByName('tag');
		const venta = this.getParameterByName('venta');
		const precio = this.getParameterByName('precio');
		const sort = this.getParameterByName('sort');

		// DOM objects
		this.searchForm = document.querySelector('.search-form');
		this.inputNombre = document.querySelector('#nombre');
		this.selectTag = document.querySelector('#tag');
		this.selectVenta = document.querySelector('#venta');
		this.inputPrecio = document.querySelector('#precio');
		this.selectOrden = document.querySelector('#sort');

		// intialize form values
		this.inputNombre.value = nombre ? nombre : '';
		this.selectTag.value = tag ? tag : '';
		this.selectVenta.value = venta ? venta : '';
		this.inputPrecio.value = precio ? precio : '';
		this.selectOrden.value = sort ? sort : '';

	}

	getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

}
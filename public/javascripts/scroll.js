'use strict';

let lastScrollPosition = 0;

(function() {

	window.addEventListener('load', () => {

		window.addEventListener('scroll', () => {
			const newScrollPosition = window.pageYOffset;
			const header = document.querySelector('.header-main');
			if (newScrollPosition < lastScrollPosition) {
				// scroll up
				header.classList.remove('header-static');
				if (newScrollPosition > 0) {
					header.classList.add('header-fixed');
				} else {
					header.classList.remove('header-fixed');
				}
			} else if (newScrollPosition > lastScrollPosition) {
				// scroll down
				header.classList.remove('header-fixed');
				header.classList.add('header-static');
			}
			lastScrollPosition = newScrollPosition;
		});

		const btnTop = document.getElementById('btn-top');

		// Click event on go top button
		btnTop.addEventListener('click', () => {
			// scroll top
			window.scroll({	top: 0, left: 0, behavior: 'smooth' });
		});
  
		// scroll event listener
		window.addEventListener('scroll', () => {
			if (window.pageYOffset > 50) {
				btnTop.classList.remove('hidden');
			} else {
				btnTop.classList.add('hidden');
			}
		});
	});
  
})();
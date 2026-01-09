export function initBurgerMenu() {
	const menuLinks = document.querySelectorAll('.menu-item');
	const burgerCheckbox = document.querySelector('.burger-checkbox');
	const overlay = document.querySelector('.overlay');
	const body = document.body;

	if (!menuLinks.length || !burgerCheckbox || !overlay) return;

	menuLinks.forEach(link => {
		link.addEventListener('click', () => {
			burgerCheckbox.checked = false;
			body.classList.remove('menu-open');
		});
	});

	burgerCheckbox.addEventListener('change', () => {
		if (burgerCheckbox.checked) {
			body.classList.add('menu-open');
		} else {
			body.classList.remove('menu-open');
		}
	});

	overlay.addEventListener('click', () => {
		burgerCheckbox.checked = false;
		body.classList.remove('menu-open');
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && burgerCheckbox.checked) {
			burgerCheckbox.checked = false;
			body.classList.remove('menu-open');
		}
	});
}
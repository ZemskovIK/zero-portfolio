export function initGalleryModal() {
	const galleryModal = document.getElementById("galleryModal") || document.getElementById('imageModal');
	const galleryModalImg = document.getElementById("galleryModalImage") || document.getElementById('modalImage');
	const galleryCloseBtn = document.querySelector(".gallery-modal-close") || document.querySelector('.modal-close');
	const galleryImages = document.querySelectorAll(".project-gallery img");
	const galleryPrevBtn = document.querySelector(".gallery-modal-prev");
	const galleryNextBtn = document.querySelector(".gallery-modal-next");
	const galleryDotsContainer = document.getElementById("galleryModalDots");

	if (!galleryModal || !galleryImages.length) return;

	let currentGalleryIndex = 0;
	let galleryImageSources = Array.from(galleryImages).map(img => img.src);

	function createGalleryDots() {
		if (!galleryDotsContainer) return;
		galleryDotsContainer.innerHTML = '';
		galleryImageSources.forEach((_, i) => {
			const dot = document.createElement("span");
			dot.classList.add("gallery-modal-dot");
			if (i === currentGalleryIndex) dot.classList.add("active");
			dot.addEventListener("click", () => {
				currentGalleryIndex = i;
				updateGalleryModal();
			});
			galleryDotsContainer.appendChild(dot);
		});
	}

	function updateGalleryModal() {
		if (galleryModalImg) {
			galleryModalImg.src = galleryImageSources[currentGalleryIndex];
		}
		const dots = document.querySelectorAll(".gallery-modal-dot");
		dots.forEach((dot, i) => {
			dot.classList.toggle("active", i === currentGalleryIndex);
		});
	}

	galleryImages.forEach((img, index) => {
		img.addEventListener("click", () => {
			galleryModal.style.display = "block";
			document.body.style.overflow = 'hidden';
			currentGalleryIndex = index;
			updateGalleryModal();
			createGalleryDots();
		});
	});

	if (galleryCloseBtn) {
		galleryCloseBtn.addEventListener("click", () => {
			galleryModal.style.display = "none";
			document.body.style.overflow = '';
		});
	}

	if (galleryPrevBtn) {
		galleryPrevBtn.addEventListener("click", () => {
			currentGalleryIndex = (currentGalleryIndex - 1 + galleryImageSources.length) % galleryImageSources.length;
			updateGalleryModal();
		});
	}

	if (galleryNextBtn) {
		galleryNextBtn.addEventListener("click", () => {
			currentGalleryIndex = (currentGalleryIndex + 1) % galleryImageSources.length;
			updateGalleryModal();
		});
	}

	galleryModal.addEventListener("click", (e) => {
		if (e.target === galleryModal) {
			galleryModal.style.display = "none";
			document.body.style.overflow = '';
		}
	});

	document.addEventListener("keydown", (e) => {
		if (galleryModal && galleryModal.style.display === "block") {
			if (e.key === "ArrowLeft") {
				currentGalleryIndex = (currentGalleryIndex - 1 + galleryImageSources.length) % galleryImageSources.length;
				updateGalleryModal();
			} else if (e.key === "ArrowRight") {
				currentGalleryIndex = (currentGalleryIndex + 1) % galleryImageSources.length;
				updateGalleryModal();
			} else if (e.key === "Escape") {
				galleryModal.style.display = "none";
				document.body.style.overflow = '';
			}
		}
	});
}



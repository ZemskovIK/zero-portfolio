import { initHeaderScroll } from './features/header.js'
import { initContactForm } from './features/contacts.js'
import { initGalleryModal } from './features/gallery-modal.js'
import { initReviewsUI } from './features/reviews.js'
import { initBurgerMenu } from './burger-menu.js'
import { initGenericSlideshows } from './features/simple-slider.js'

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll()
  initContactForm()
  initGalleryModal()
  initBurgerMenu()
  initGenericSlideshows()
  initReviewsUI();

  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = new Date().getFullYear()
})
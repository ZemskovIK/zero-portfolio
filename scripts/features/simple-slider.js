export function initGenericSlideshows() {
  const reviewsSlideshow = document.querySelector('#reviews .slideshow-container');
  const allSlideshows = Array.from(document.querySelectorAll('.slideshow-container'));
  const targetSlideshows = allSlideshows.filter(el => !reviewsSlideshow || !reviewsSlideshow.isSameNode(el));
  if (!targetSlideshows.length) return;

  let currentIndex = 0;

  function showSlide(index, slides, dots) {
    if (index >= slides.length) currentIndex = 0;
    if (index < 0) currentIndex = slides.length - 1;
    slides.forEach(slide => { slide.style.display = 'none'; });
    dots.forEach(dot => dot.classList.remove('active'));
    slides[currentIndex].style.display = 'block';
    if (dots.length > 0) dots[currentIndex].classList.add('active');
  }

  function createDots(dotsContainer, slides) {
    dotsContainer.innerHTML = '';
    return slides.map((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dotsContainer.appendChild(dot);
      return dot;
    });
  }

  function initOne(slideshow) {
    const slides = Array.from(slideshow.querySelectorAll('.slide'));
    const dotsContainer = slideshow.querySelector('.dots-container');
    if (!slides.length || !dotsContainer) return;
    const dots = createDots(dotsContainer, slides);
    currentIndex = 0;
    showSlide(currentIndex, slides, dots);
    window.changeSlide = (step) => {
      currentIndex += step;
      showSlide(currentIndex, slides, dots);
    };
    window.setSlide = (index) => {
      currentIndex = index - 1;
      showSlide(currentIndex, slides, dots);
    };
  }

  targetSlideshows.forEach(initOne);
}



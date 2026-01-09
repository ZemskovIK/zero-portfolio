document.addEventListener('DOMContentLoaded', function () {
});

export function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', onScroll);
  onScroll();
}



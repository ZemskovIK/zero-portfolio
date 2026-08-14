export function initServicesAccordion() {
  const serviceItems = document.querySelectorAll('.service-item');
  if (!serviceItems.length) return;

  serviceItems.forEach((item) => {
    const button = item.querySelector('.service-summary');
    const panel = item.querySelector('.service-steps');
    const toggle = item.querySelector('.service-toggle');

    if (!button || !panel || !toggle) return;

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('service-item-open');

      serviceItems.forEach((currentItem) => {
        const currentButton = currentItem.querySelector('.service-summary');
        const currentPanel = currentItem.querySelector('.service-steps');
        const currentToggle = currentItem.querySelector('.service-toggle');

        currentItem.classList.remove('service-item-open');
        currentButton?.setAttribute('aria-expanded', 'false');
        currentToggle?.classList.remove('service-toggle-close');
        currentPanel?.setAttribute('hidden', '');
      });

      if (isOpen) return;

      item.classList.add('service-item-open');
      button.setAttribute('aria-expanded', 'true');
      toggle.classList.add('service-toggle-close');
      panel.removeAttribute('hidden');
    });
  });
}

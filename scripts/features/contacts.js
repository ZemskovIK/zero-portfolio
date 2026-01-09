export function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusDiv = document.getElementById('contactFormStatus');

  if (!form) return;

  form.setAttribute('novalidate', 'true');

  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const messageInput = form.querySelector('textarea[name="message"]');

  function getEmailJSConfig() {
    if (window.EMAILJS_CONFIG) {
      return window.EMAILJS_CONFIG;
    }
    return null;
  }

  function markError(input, message) {
    if (!input) return message;
    input.style.borderColor = '#ff4757';
    return message;
  }

  function clearErrors() {
    ;[nameInput, emailInput, messageInput].forEach((el) => {
      if (el) {
        el.style.borderColor = '';
      }
    });
    if (statusDiv) {
      statusDiv.textContent = '';
      statusDiv.style.color = '';
    }
  }

  ;[nameInput, emailInput, messageInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => {
      el.style.borderColor = '';
      if (statusDiv) {
        statusDiv.textContent = '';
        statusDiv.style.color = '';
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailjsConfig = getEmailJSConfig();

    if (!emailjsConfig || typeof emailjs === 'undefined') {
      if (statusDiv) {
        statusDiv.textContent = 'Форма временно недоступна. Попробуйте позже.';
        statusDiv.style.color = 'red';
      }
      console.error('EmailJS конфигурация не найдена или библиотека не загружена');
      return;
    }

    try {
      emailjs.init(emailjsConfig.PUBLIC_KEY);
    } catch (e) {
      console.log('EmailJS уже инициализирован');
    }

    clearErrors();
    const errors = [];
    const nameVal = (nameInput?.value || '').trim();
    const emailVal = (emailInput?.value || '').trim();
    const messageVal = (messageInput?.value || '').trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailVal);

    if (!nameVal) errors.push(markError(nameInput, 'Укажите ваше имя'));
    if (!emailVal || !emailOk) errors.push(markError(emailInput, 'Введите корректный email'));
    if (!messageVal) errors.push(markError(messageInput, 'Введите сообщение'));

    if (errors.length) {
      if (statusDiv) {
        statusDiv.textContent = errors.filter(Boolean).join('. ');
        statusDiv.style.color = 'red';
      }
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    if (statusDiv) {
      statusDiv.textContent = '';
      statusDiv.style.color = '';
    }

    const templateParams = {
      name: nameVal,
      email: emailVal,
      message: messageVal,
    };

    try {
      await emailjs.send(
        emailjsConfig.SERVICE_ID,
        emailjsConfig.TEMPLATE_ID,
        templateParams
      );

      if (statusDiv) {
        statusDiv.textContent = 'Ваше сообщение успешно отправлено!';
        statusDiv.style.color = 'green';
      }
      form.reset();
    } catch (error) {
      console.error('Ошибка EmailJS:', error);
      if (statusDiv) {
        statusDiv.textContent = 'Произошла ошибка при отправке. Попробуйте позже.';
        statusDiv.style.color = 'red';
      }
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}
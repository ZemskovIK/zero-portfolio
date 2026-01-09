function initScrollIndicators() {
  const reviewCards = document.querySelectorAll('.review-card')
  reviewCards.forEach((card) => {
    const content = card.querySelector('.review-content')
    if (!content) return

    // Проверяем, нужен ли индикатор прокрутки
    const needsIndicator = content.scrollHeight > content.clientHeight + 10

    if (needsIndicator) {
      content.classList.add('scrollable')

      // Простой индикатор при скролле
      content.addEventListener('scroll', function () {
        this.classList.toggle('scrolled-to-bottom',
          this.scrollTop + this.clientHeight >= this.scrollHeight - 10
        )
      })
    } else {
      content.classList.remove('scrollable')
    }
  })
}

function initReviewsSlider() {
  const slides = document.querySelectorAll('.slide')
  const dotsContainer = document.querySelector('.dots-container')
  if (!slides.length || !dotsContainer) return

  let currentIndex = 0

  // Функции слайдера
  function showSlide(index) {
    if (index >= slides.length) currentIndex = 0
    if (index < 0) currentIndex = slides.length - 1

    slides.forEach((slide, i) => {
      slide.style.display = i === currentIndex ? 'block' : 'none'
      const content = slide.querySelector('.review-content')
      if (content) content.scrollTop = 0
    })

    // Обновляем точки
    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex)
    })
  }

  function changeSlide(step) {
    currentIndex += step
    showSlide(currentIndex)
    setTimeout(initScrollIndicators, 50)
  }

  dotsContainer.innerHTML = ''
  slides.forEach((_, i) => {
    const dot = document.createElement('span')
    dot.classList.add('dot')
    if (i === currentIndex) dot.classList.add('active')
    dot.addEventListener('click', () => {
      currentIndex = i
      showSlide(currentIndex)
      setTimeout(initScrollIndicators, 50)
    })
    dotsContainer.appendChild(dot)
  })

  // Автопереключение
  let autoSlide = setInterval(() => changeSlide(1), 5000)
  const slideshow = document.querySelector('.slideshow-container')
  if (slideshow) {
    slideshow.addEventListener('mouseenter', () => clearInterval(autoSlide))
    slideshow.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => changeSlide(1), 5000)
    })
  }

  // Экспортируем функции для стрелок
  window.changeSlide = changeSlide
  window.setSlide = (index) => {
    currentIndex = index - 1
    showSlide(currentIndex)
    setTimeout(initScrollIndicators, 50)
  }

  // Первый показ
  showSlide(currentIndex)
  setTimeout(initScrollIndicators, 100)
}

export function renderReviewsFromData(reviewsData) {
  const reviewsInner = document.querySelector('.reviews-inner')
  if (!reviewsInner) return

  reviewsInner.innerHTML = ''

  reviewsData.forEach((review, index) => {
    const slideDiv = document.createElement('div')
    slideDiv.className = 'review-card slide fade'
    slideDiv.style.display = index === 0 ? 'block' : 'none'

    const reviewDate = new Date(review.created_at).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    let starsHtml = ''
    for (let i = 0; i < 5; i++) {
      starsHtml += `<i class="fas fa-star${i < review.rating ? '' : ' empty'}" 
                      style="color: ${i < review.rating ? '#FFD700' : '#ddd'}"></i>`
    }

    const name = String(review.author_name || '').trim()

    slideDiv.innerHTML = `
      <div class="review-header">
        <div class="reviews-${review.gender === 'm' ? 'm' : 'w'}-icon">
          <i class="fa-solid fa-circle-user"></i>
        </div>
        <div class="review-author">
          <h3>${name}</h3>
          <div class="review-rating">${starsHtml}</div>
        </div>
      </div>
      <div class="review-content"><p>"${review.content}"</p></div>
      <div class="review-date">${reviewDate}</div>
    `

    reviewsInner.appendChild(slideDiv)
  })

  setTimeout(() => {
    initReviewsSlider()
    initScrollIndicators()
  }, 50)
}

export async function initReviewsSection() {
  const reviewsSection = document.getElementById('reviews')
  if (!reviewsSection) return

  const targetContainer = reviewsSection.querySelector('.reviews-inner') ||
    reviewsSection.querySelector('.slideshow-container')
  if (!targetContainer) return

  targetContainer.innerHTML = `
    <div class="reviews-loading">
      <i class="fas fa-circle-notch fa-spin"></i>
      <p>Загружаю отзывы...</p>
    </div>
  `

  // Ждём инициализацию Supabase
  if (typeof window.fetchAllReviews !== 'function') {
    setTimeout(initReviewsSection, 1000)
    return
  }

  try {
    const reviews = await window.fetchAllReviews()
    targetContainer.innerHTML = ''

    if (!reviews || reviews.length === 0) {
      targetContainer.innerHTML = `
        <div class="no-reviews">
          <p>Пока нет отзывов. Будьте первым!</p>
        </div>`
      return
    }

    renderReviewsFromData(reviews)
  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error)
    targetContainer.innerHTML = `
      <div class="reviews-error">
        <p>Не удалось загрузить отзывы</p>
        <button onclick="location.reload()">Обновить страницу</button>
      </div>`
  }
}

export function initReviewForm() {
  const reviewForm = document.getElementById('reviewForm')
  if (!reviewForm || typeof window.submitReview !== 'function') return

  reviewForm.setAttribute('novalidate', 'true')
  const statusDiv = document.getElementById('reviewFormStatus')

  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Собираем данные
    const formData = new FormData(reviewForm)
    const ratingInput = reviewForm.querySelector('input[name="rating"]:checked')
    const genderInput = reviewForm.querySelector('input[name="gender"]:checked')

    const errors = []
    if (!formData.get('code')?.trim()) errors.push('Укажите код')
    if (!formData.get('name')?.trim()) errors.push('Укажите имя')
    if (!genderInput) errors.push('Выберите пол')
    if (!ratingInput) errors.push('Поставьте оценку')
    if (!formData.get('content')?.trim()) errors.push('Введите текст отзыва')

    if (errors.length) {
      if (statusDiv) {
        statusDiv.textContent = errors.join('. ')
        statusDiv.style.color = 'red'
      }
      return
    }

    const submitBtn = reviewForm.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent

    submitBtn.disabled = true
    submitBtn.textContent = 'Отправка...'
    if (statusDiv) statusDiv.textContent = ''

    try {
      const result = await window.submitReview({
        code: formData.get('code').trim().toUpperCase(),
        name: formData.get('name').trim(),
        gender: genderInput.value,
        rating: parseInt(ratingInput.value),
        content: formData.get('content').trim()
      })

      if (result.success) {
        if (statusDiv) {
          statusDiv.textContent = result.message
          statusDiv.style.color = 'green'
        }
        reviewForm.reset()
        setTimeout(initReviewsSection, 1000)
      } else {
        if (statusDiv) {
          statusDiv.textContent = result.error
          statusDiv.style.color = 'red'
        }
      }
    } catch (error) {
      console.error('Ошибка отправки:', error)
      if (statusDiv) {
        statusDiv.textContent = 'Произошла ошибка при отправке'
        statusDiv.style.color = 'red'
      }
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = originalText
    }
  })
}

export function initReviewsUI() {
  setTimeout(() => {
    initReviewsSection()
    initReviewForm()
  }, 1500)

  // Обновляем индикаторы при ресайзе
  window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimeout)
    window.resizeTimeout = setTimeout(initScrollIndicators, 250)
  })
}
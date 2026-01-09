let supabaseClient = null;
let isInitializing = false;
let initPromise = null;

function getSupabaseConfig() {
  if (window.SUPABASE_CONFIG) {
    return window.SUPABASE_CONFIG;
  }
}

function initSupabase() {
  if (supabaseClient) {
    return Promise.resolve(supabaseClient);
  }

  if (isInitializing) {
    return initPromise;
  }

  isInitializing = true;

  initPromise = new Promise(async (resolve, reject) => {
    try {
      // Проверяем, загружена ли библиотека
      if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@supabase/supabase-js@2';
        script.async = true;

        await new Promise((scriptResolve, scriptReject) => {
          script.onload = scriptResolve;
          script.onerror = () => {
            scriptReject(new Error('Не удалось загрузить Supabase библиотеку'));
          };
          document.head.appendChild(script);
        });
      }

      if (!window.supabase?.createClient) {
        throw new Error('Библиотека Supabase не загрузилась правильно');
      }

      const { createClient } = window.supabase;
      const config = getSupabaseConfig();

      // Проверяем конфигурацию
      if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
        throw new Error('Не настроены Supabase ключи');
      }

      supabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
      console.log('Supabase успешно инициализирован для проекта:', config.SUPABASE_URL);

      resolve(supabaseClient);

    } catch (error) {
      console.error('Ошибка инициализации Supabase:', error);
      supabaseClient = null;
      reject(error);

    } finally {
      isInitializing = false;
    }
  });

  return initPromise;
}

// Функция отправки отзыва
window.submitReview = async (reviewData) => {
  try {
    const supabase = await initSupabase();

    // Базовые проверки
    const cleanCode = (reviewData.code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'Введите код' };
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: 'Оценка должна быть от 1 до 5' };
    }

    if (!['m', 'f'].includes(reviewData.gender)) {
      return { success: false, error: 'Выберите пол' };
    }

    console.log('Отправка отзыва с кодом:', cleanCode);

    const { data, error } = await supabase.rpc(
      'submit_review_with_code_check',
      {
        p_code: cleanCode,
        p_author_name: (reviewData.name || '').trim(),
        p_rating: parseInt(reviewData.rating),
        p_content: (reviewData.content || '').trim(),
        p_gender: reviewData.gender
      }
    );

    console.log('Ответ от базы:', data, error);

    if (error) {
      console.error('Ошибка RPC:', error);
      return {
        success: false,
        error: 'Ошибка соединения с базой данных'
      };
    }

    if (data && data.startsWith('ERROR:')) {
      return {
        success: false,
        error: data.replace('ERROR:', '').trim()
      };
    }

    return {
      success: true,
      message: 'Спасибо! Ваш отзыв успешно опубликован.'
    };

  } catch (error) {
    console.error('Неожиданная ошибка:', error);
    return {
      success: false,
      error: 'Произошла ошибка. Попробуйте еще раз.'
    };
  }
};

// Функция для загрузки всех отзывов
window.fetchAllReviews = async () => {
  try {
    const supabase = await initSupabase();

    console.log('Загрузка отзывов...');

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки отзывов:', error);
      return [];
    }

    console.log('Загружено отзывов:', data?.length || 0);
    return data || [];

  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error);
    return [];
  }
};

// Инициализация при загрузке страницы
(function autoInit() {
  console.log('Начало инициализации Supabase...');

  // Ждём немного перед инициализацией
  setTimeout(async () => {
    try {
      await initSupabase();
      console.log('Supabase автоматически инициализирован');
    } catch (error) {
      console.warn('Автоматическая инициализация Supabase не удалась:', error.message);
    }
  }, 1000);
})();
let supabaseClient = null;
let isInitializing = false;
let initPromise = null;

function getSupabaseConfig() {
  if (window.SUPABASE_CONFIG) {
    return window.SUPABASE_CONFIG;
  }
  return null;
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

      if (!config?.SUPABASE_URL || !config?.SUPABASE_ANON_KEY) {
        throw new Error('Не настроены Supabase ключи');
      }

      supabaseClient = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
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

window.submitReview = async (reviewData) => {
  try {
    const supabase = await initSupabase();

    const cleanCode = (reviewData.code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, error: 'Введите код' };
    }

    if (!['m', 'f'].includes(reviewData.gender)) {
      return { success: false, error: 'Выберите пол' };
    }

    const rpcPayload = {
      p_code: cleanCode,
      p_author_name: (reviewData.name || '').trim(),
      p_content: (reviewData.content || '').trim(),
      p_gender: reviewData.gender
    };

    let { data, error } = await supabase.rpc(
      'submit_review_with_code_check',
      rpcPayload
    );

    if (error && error.code === 'PGRST202') {
      ({ data, error } = await supabase.rpc(
        'submit_review_with_code_check',
        {
          ...rpcPayload,
          p_rating: 5
        }
      ));
    }

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

window.fetchAllReviews = async () => {
  try {
    const supabase = await initSupabase();

    let { data, error } = await supabase
      .from('public_reviews')
      .select('author_name, content, gender, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      const fallback = await supabase
        .from('reviews')
        .select('author_name, content, gender, created_at')
        .order('created_at', { ascending: false });

      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error('Ошибка загрузки отзывов:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error);
    return [];
  }
};

(function autoInit() {
  initSupabase().catch(() => { });
})();
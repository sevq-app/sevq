import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isHttpUrl = (value?: string): value is string =>
  !!value && /^https?:\/\//i.test(value.trim());

if (!isHttpUrl(supabaseUrl) || !supabaseAnonKey) {
  // Хостинг не настроен (переменные окружения пустые или сборка без секретов).
  // Не роняем всё приложение вслепую: показываем понятный экран вместо белого.
  if (typeof document !== 'undefined') {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML =
        '<div style="font-family:system-ui,sans-serif;padding:48px 24px;max-width:560px;margin:0 auto;text-align:center">' +
        '<h1 style="font-size:22px;margin-bottom:12px">⚙️ Сервис временно недоступен</h1>' +
        '<p style="color:#666;font-size:15px;line-height:1.5">Приложению не хватает конфигурации серверной части ' +
        '(VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Обратитесь к разработчику.</p></div>';
    }
  }
  throw new Error(
    'Supabase configuration is missing or invalid: set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

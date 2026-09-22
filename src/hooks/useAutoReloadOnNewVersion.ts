import { useEffect } from 'react';
import { APP_VERSION } from '@/buildVersion';

const RELOAD_FLAG_KEY = 'sevchik_reload_target_version';

/**
 * GitHub Pages кэширует index.html в браузере: после нового деплоя старые
 * файлы сборки удаляются, а закэшированная страница продолжает на них
 * ссылаться — получается белый экран или "не обновилось". Этот хук
 * периодически и при возврате на вкладку сверяет версию собранного
 * бандла с той, что реально лежит на сервере (запрос всегда идёт мимо
 * HTTP-кэша), и тихо перезагружает страницу, если вышло обновление —
 * вручную жать "обновить" больше не нужно.
 */
export function useAutoReloadOnNewVersion() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    // Если мы только что сами перезагрузились ради конкретной версии, но
    // после перезагрузки в бандле всё ещё старая версия — значит кэш
    // браузера отдаёт ту же старую страницу и нового деплоя мы не
    // получили. Не зацикливаемся: пропускаем эту проверку, следующая
    // попытка будет по таймеру/возврату на вкладку.
    try {
      const pendingTarget = sessionStorage.getItem(RELOAD_FLAG_KEY);
      if (pendingTarget) {
        sessionStorage.removeItem(RELOAD_FLAG_KEY);
        if (pendingTarget !== APP_VERSION) return;
      }
    } catch {
      // sessionStorage недоступен (приватный режим и т.п.) — просто без защиты от цикла
    }

    let cancelled = false;
    let reloaded = false;

    const checkVersion = async () => {
      if (reloaded) return;
      try {
        const res = await fetch('./version.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data.version || data.version === APP_VERSION) return;

        reloaded = true;
        try {
          sessionStorage.setItem(RELOAD_FLAG_KEY, data.version);
        } catch {
          // недоступно — переживём без защиты от цикла
        }
        // Обходим HTTP-кэш самого index.html: другой query-параметр —
        // гарантированно новый запрос, а не повторная выдача старой страницы
        const url = new URL(window.location.href);
        url.searchParams.set('v', data.version);
        window.location.replace(url.toString());
      } catch {
        // сеть недоступна — молча игнорируем, проверим в следующий раз
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 10 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkVersion();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}

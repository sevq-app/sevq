# GitHub Pages: почему белый экран (диагноз, 2026-09-25)

Проверено через публичный API GitHub Actions + живую проверку в headless Chromium.

## Что происходит
1. Workflow «Deploy to GitHub Pages» НЕ падает — последние деплои успешны (#113, main@9c3b2fa).
   Статусы cancelled — это безобидная гонка push+workflow_dispatch (cancel-in-progress: true).
2. Сборка на Actions идёт с пустыми секретами: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
   не заданы в репозитории (Settings → Secrets and variables → Actions).
3. src/lib/supabase.ts бросает исключение при инициализации модуля → React не монтируется →
   белый экран. В консоли браузера ровно одна ошибка:
   `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.`

Vercel работает, потому что там эти переменные заданы в настройках проекта.

## Как починить (2–3 минуты, доступ к сайту от вас)
Вариант А (рекомендую): убрать Pages-деплой из main и сделать Vercel основным.
  - GitHub → Settings → Pages → Source: отключить; либо удалить .github/workflows/deploy.yml.
  - Либо оставить Pages как тестовый стенд, но тогда нужен вариант Б.
Вариант Б: добавить секреты в репозиторий sevq-app/sevq:
  VITE_SUPABASE_URL=https://<проект>.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon key>
  затем перезапустить Deploy workflow (Run workflow).

## Защита от белого экрана (опционально)
fix_supabase.ts — патч для src/lib/supabase.ts (проверен: typecheck и build проходят).
При отсутствии/некорректных env вместо белого экрана показывает понятную заглушку.
Применить: cp fix_supabase.ts src/lib/supabase.ts

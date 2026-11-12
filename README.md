# manypon portfolio

Ванильный HTML/CSS/JS. Сайт лежит в `public/`, серверная часть (форма и /admin) в `api/` и `lib/`.

## Деплой на Vercel

1. Залей проект в GitHub и импортируй в Vercel (Framework Preset: Other, настройки из `vercel.json` подхватятся).
2. В проекте: Storage → Create → Blob → Private. Токен `BLOB_READ_WRITE_TOKEN` добавится сам.
3. Локально выполни `npm install` и `npm run set-password`. Придумай длинный пароль (минимум 14 символов, лучше фраза из 4–5 слов).
4. Скрипт выведет `ADMIN_PASSWORD_HASH` и `SESSION_SECRET`. Добавь обе переменные в Settings → Environment Variables и сделай Redeploy.
5. Settings → Firewall → Custom Rules: правило Rate Limit для пути `/api/login` (например, 10 запросов в минуту на IP). Это защита от перебора поверх встроенной.

Админка: `/admin`. Заявки из формы Contact хранятся как отдельные файлы в Blob.

## Локальный запуск

`npx vercel dev` (нужен `vercel link` и `vercel env pull`, чтобы подтянуть переменные).

## Где править контент

- Тексты и ссылки: `public/*.html`.
- Проценты навыков: `style="--level:.95"` и подпись в `public/skills.html`.
- Цвета и размеры: `public/css/base/tokens.css`.

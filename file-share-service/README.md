# File Share Service

Сервис для загрузки файлов

## Запуск
1. `npm install`
2. `npm run dev`
3. Сервер будет доступен на `http://localhost:3000/`

## ENV переменные
- `PORT` — порт (по умолчанию 3000)
- `JWT_SECRET` — секрет для подписи JWT
- `EXPIRE_DAYS` — количество дней до удаления не скачанных файлов (по умолчанию 30)

## API
- `POST /api/register` — регистрация
- `POST /api/login` — логин
- `POST /api/upload` — загрузка файла (требует авторизации)
- `GET /d/:id` — скачивание файла по id
- `GET /api/file/:id` — информация о файле


# Weather Chart Service
---

## Установка и запуск

Для сервиса необходим docker.
Например, можно поставить docker-desktop на Windows

После перехода в папку сервиса нужно выполнить команду:

```bash
docker compose up --build
```

## API

### GET /weather?city={city} - Получить прогноз и график (JSON)
```
http://localhost:3000/weather?city=Berlin
```

---

### GET /weather/chart?city={city} - Получить график напрямую (PNG)
```
http://localhost:3000/weather/chart?city=Tokyo
```
График выглядит следующим образом:
<img width="1200" height="401" alt="image" src="https://github.com/user-attachments/assets/cfb857d0-d55c-4735-8bc0-2a556054f292" />

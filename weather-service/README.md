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

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

### Получить прогноз и график (JSON)
```
GET /weather?city=London
```
```
http://localhost:3000/weather?city=Berlin
```

---

### Получить график напрямую (PNG)
```
GET /weather/chart?city=Paris
```
```
http://localhost:3000/weather/chart?city=Tokyo
```

# Weather Chart Service
---

## Установка и запуск

### 1) Клонировать проект
```bash
git clone 
cd weather-service
```

### 2) Запуск через Docker Compose
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
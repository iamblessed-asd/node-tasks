import express from 'express';
import dotenv from 'dotenv';
import { getWeatherWithChart, getWeatherChartBuffer } from './weatherService';

dotenv.config();
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

//эндпоинт для JSON вывода
app.get('/weather', async (req, res) => {
  const city = String(req.query.city || '').trim();
  if (!city) return res.status(400).json({ error: 'нужен параметр `city`' });

  try {
    const result = await getWeatherWithChart(city);
    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ошибка получения графика' });
  }
});

//эндпоинт для PNG вывода
app.get('/weather/chart', async (req, res) => {
  const city = String(req.query.city || '').trim();
  if (!city) return res.status(400).json({ error: 'нужен параметр `city`' });

  try {
    const buffer = await getWeatherChartBuffer(city);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ошибка получения графика' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервис запущен на http://localhost:${PORT}`);
  console.log(`Пример API с графиком: http://localhost:${PORT}/weather/chart?city=Paris`);
  console.log(`Пример API с JSON: http://localhost:${PORT}/weather?city=London`);
});

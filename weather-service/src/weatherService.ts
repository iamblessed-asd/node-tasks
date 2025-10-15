import fetch from 'node-fetch';
import Redis from 'ioredis';
import { createTempChartDataUrl, createTempChartBuffer } from './chart';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);
const CACHE_TTL_SECONDS = process.env.CACHE_TTL_SECONDS ? Number(process.env.CACHE_TTL_SECONDS) : 900;

type GeoResult = { latitude: number; longitude: number; name: string };

async function geocodeCity(city: string): Promise<GeoResult> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Ошибка в обращении к geocoding-api: ${r.status}`);
  const data: any = await r.json();
  if (!data.results || data.results.length === 0) throw new Error(`city not found: ${city}`);
  const first = data.results[0];
  return { latitude: first.latitude, longitude: first.longitude, name: first.name + (first.country ? ', ' + first.country : '') };
}

async function fetchForecast(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=UTC`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Ошибка в обращении к open-meteo: ${r.status}`);
  const data: any = await r.json();
  return data;
}

async function loadWeatherData(city: string) {
  const geo = await geocodeCity(city);
  const forecast = await fetchForecast(geo.latitude, geo.longitude);

  const times: string[] = forecast.hourly?.time ?? [];
  const temps: number[] = forecast.hourly?.temperature_2m ?? [];

  const now = new Date();
  const nowIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours())).toISOString().slice(0,13) + ':00:00Z';
  let startIdx = times.findIndex(t => t === nowIso);
  if (startIdx === -1) startIdx = 0;
  const endIdx = Math.min(startIdx + 24, times.length);

  return {
    geo,
    time: times.slice(startIdx, endIdx),
    temp: temps.slice(startIdx, endIdx)
  };
}

export async function getWeatherWithChart(city: string) {
  const cacheKey = `weather:${city.toLowerCase()}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return { ...JSON.parse(cached), source: 'cache' };
    } catch {}
  }

  const { geo, time, temp } = await loadWeatherData(city);
  const chartDataUrl = await createTempChartDataUrl(time, temp, `${geo.name} — следующие 24 часа`);

  const payload = { city: geo.name, hourly: { time, temperature_2m: temp }, chartDataUrl, fetchedAt: new Date().toISOString() };
  await redis.set(cacheKey, JSON.stringify(payload), 'EX', CACHE_TTL_SECONDS);
  return { ...payload, source: 'api' };
}

export async function getWeatherChartBuffer(city: string) {
  const { geo, time, temp } = await loadWeatherData(city);
  return createTempChartBuffer(time, temp, `${geo.name} — 24 часа`);
}

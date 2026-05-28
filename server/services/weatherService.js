// server/services/weatherService.js
// Helpers that talk to OpenWeatherMap.

const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const ZIP_URL = 'https://api.openweathermap.org/geo/1.0/zip';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

/**
 * Resolve a free-text location to coordinates.
 * Accepts city names, landmarks, "City, Country", or US zip codes.
 * Returns { name, country, lat, lon } or null if not found.
 */
async function resolveLocation(input) {
  if (!input || typeof input !== 'string') return null;
  const query = input.trim();
  if (!query) return null;

  // Detect US zip code (5 digits)
  const isZip = /^\d{5}$/.test(query);

  try {
    if (isZip) {
      const res = await axios.get(ZIP_URL, {
        params: { zip: `${query},US`, appid: API_KEY },
      });
      const { name, lat, lon, country } = res.data;
      return { name, country, lat, lon };
    }

    // Otherwise: city / landmark / "City, Country" search
    const res = await axios.get(GEO_URL, {
      params: { q: query, limit: 1, appid: API_KEY },
    });
    if (!Array.isArray(res.data) || res.data.length === 0) return null;
    const { name, country, lat, lon } = res.data[0];
    return { name, country, lat, lon };
  } catch (err) {
    console.error('resolveLocation error:', err.message);
    return null;
  }
}

/**
 * Fetch current weather + 5-day forecast for given coordinates.
 * Returns { current, forecast } or throws on failure.
 */
async function fetchWeatherByCoords(lat, lon) {
  const [currentRes, forecastRes] = await Promise.all([
    axios.get(WEATHER_URL, {
      params: { lat, lon, units: 'metric', appid: API_KEY },
    }),
    axios.get(FORECAST_URL, {
      params: { lat, lon, units: 'metric', appid: API_KEY },
    }),
  ]);

  return {
    current: currentRes.data,
    forecast: forecastRes.data,
  };
}

module.exports = { resolveLocation, fetchWeatherByCoords };
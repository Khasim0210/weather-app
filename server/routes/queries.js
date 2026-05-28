// server/routes/queries.js
// CRUD endpoints for weather queries.

const express = require('express');
const db = require('../db');
const { validateDateRange } = require('../utils/validators');
const { resolveLocation, fetchWeatherByCoords } = require('../services/weatherService');

const router = express.Router();

// ---------- CREATE ----------
// POST /api/queries
// Body: { location, start_date, end_date, notes? }
router.post('/', async (req, res) => {
  try {
    const { location, start_date, end_date, notes } = req.body;

    // 1. Basic presence check
    if (!location || !start_date || !end_date) {
      return res.status(400).json({
        error: 'location, start_date, and end_date are required',
      });
    }

    // 2. Validate date range
    const dateCheck = validateDateRange(start_date, end_date);
    if (!dateCheck.valid) {
      return res.status(400).json({ error: dateCheck.error });
    }

    // 3. Validate location exists (fuzzy match via OpenWeatherMap geocoding)
    const resolved = await resolveLocation(location);
    if (!resolved) {
      return res.status(404).json({
        error: `Location "${location}" could not be found. Please try a different spelling, a nearby city, or a 5-digit US zip code.`,
      });
    }

    // 4. Fetch real weather data
    const weather = await fetchWeatherByCoords(resolved.lat, resolved.lon);

    // 5. Insert into database
    const stmt = db.prepare(`
      INSERT INTO weather_queries
        (location, resolved_name, latitude, longitude, start_date, end_date, weather_data, notes)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      location,
      `${resolved.name}, ${resolved.country}`,
      resolved.lat,
      resolved.lon,
      start_date,
      end_date,
      JSON.stringify(weather),
      notes || null
    );

    // 6. Return the saved row
    const saved = db.prepare('SELECT * FROM weather_queries WHERE id = ?').get(info.lastInsertRowid);
    saved.weather_data = JSON.parse(saved.weather_data);

    res.status(201).json({
      message: 'Weather query saved successfully',
      data: saved,
    });
  } catch (err) {
    console.error('CREATE /api/queries error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
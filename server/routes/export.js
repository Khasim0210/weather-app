// server/routes/export.js
// Endpoints that export stored weather queries in various formats.

const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * Helper: load all weather queries from the database with weather_data parsed.
 * Used by every export endpoint.
 */
function loadAllQueries() {
  const rows = db.prepare('SELECT * FROM weather_queries ORDER BY created_at DESC').all();
  return rows.map((row) => ({
    ...row,
    weather_data: JSON.parse(row.weather_data),
  }));
}

/**
 * Helper: build a filename with today's date for downloads.
 * e.g. "weather-queries-2026-05-28.json"
 */
function buildFilename(extension) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `weather-queries-${today}.${extension}`;
}

// ---------- EXPORT: JSON ----------
// GET /api/export/json
router.get('/json', (req, res) => {
  try {
    const data = loadAllQueries();
    const filename = buildFilename('json');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify({ exported_at: new Date().toISOString(), count: data.length, data }, null, 2));
  } catch (err) {
    console.error('EXPORT /json error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
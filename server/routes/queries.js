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

// ---------- READ (list all) ----------
// GET /api/queries
// Optional query params:
//   ?location=Dallas         (case-insensitive partial match)
//   ?sort=newest|oldest      (default: newest)
//   ?limit=20                (default: 100)
router.get('/', (req, res) => {
  try {
    const { location, sort = 'newest', limit = 100 } = req.query;

    let sql = 'SELECT * FROM weather_queries';
    const params = [];

    if (location) {
      sql += ' WHERE location LIKE ? OR resolved_name LIKE ?';
      params.push(`%${location}%`, `%${location}%`);
    }

    sql += sort === 'oldest' ? ' ORDER BY created_at ASC' : ' ORDER BY created_at DESC';
    sql += ' LIMIT ?';
    params.push(Number(limit) || 100);

    const rows = db.prepare(sql).all(...params);

    // Parse the weather_data JSON string back into an object for each row
    const data = rows.map((row) => ({
      ...row,
      weather_data: JSON.parse(row.weather_data),
    }));

    res.json({
      count: data.length,
      data,
    });
  } catch (err) {
    console.error('READ /api/queries error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ---------- READ (single by ID) ----------
// GET /api/queries/:id
router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id must be a positive integer' });
    }

    const row = db.prepare('SELECT * FROM weather_queries WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: `No weather query found with id=${id}` });
    }

    row.weather_data = JSON.parse(row.weather_data);
    res.json({ data: row });
  } catch (err) {
    console.error('READ /api/queries/:id error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ---------- UPDATE ----------
// PUT /api/queries/:id
// Body (all fields optional): { location?, start_date?, end_date?, notes? }
// If location or dates change, weather data is automatically re-fetched.
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id must be a positive integer' });
    }

    // 1. Make sure the record exists
    const existing = db.prepare('SELECT * FROM weather_queries WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: `No weather query found with id=${id}` });
    }

    const { location, start_date, end_date, notes } = req.body;

    // 2. Reject empty update requests
    if (
      location === undefined &&
      start_date === undefined &&
      end_date === undefined &&
      notes === undefined
    ) {
      return res.status(400).json({
        error: 'Provide at least one field to update: location, start_date, end_date, or notes',
      });
    }

    // 3. Merge new values with existing ones
    const newLocation = location !== undefined ? location : existing.location;
    const newStart = start_date !== undefined ? start_date : existing.start_date;
    const newEnd = end_date !== undefined ? end_date : existing.end_date;
    const newNotes = notes !== undefined ? notes : existing.notes;

    // 4. Re-validate date range (always — cheap and safer)
    const dateCheck = validateDateRange(newStart, newEnd);
    if (!dateCheck.valid) {
      return res.status(400).json({ error: dateCheck.error });
    }

    // 5. Did location or dates change? If yes, refresh weather data.
    const locationChanged = location !== undefined && location !== existing.location;
    const datesChanged =
      (start_date !== undefined && start_date !== existing.start_date) ||
      (end_date !== undefined && end_date !== existing.end_date);

    let resolvedName = existing.resolved_name;
    let latitude = existing.latitude;
    let longitude = existing.longitude;
    let weatherJson = existing.weather_data;

    if (locationChanged || datesChanged) {
      // Re-validate the (possibly new) location
      const resolved = await resolveLocation(newLocation);
      if (!resolved) {
        return res.status(404).json({
          error: `Location "${newLocation}" could not be found. Please try a different spelling or a 5-digit US zip code.`,
        });
      }

      // Fetch fresh weather for the (possibly new) coordinates
      const weather = await fetchWeatherByCoords(resolved.lat, resolved.lon);

      resolvedName = `${resolved.name}, ${resolved.country}`;
      latitude = resolved.lat;
      longitude = resolved.lon;
      weatherJson = JSON.stringify(weather);
    }

    // 6. Save changes
    db.prepare(`
      UPDATE weather_queries
      SET location = ?,
          resolved_name = ?,
          latitude = ?,
          longitude = ?,
          start_date = ?,
          end_date = ?,
          weather_data = ?,
          notes = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      newLocation,
      resolvedName,
      latitude,
      longitude,
      newStart,
      newEnd,
      weatherJson,
      newNotes,
      id
    );

    // 7. Return the updated row
    const updated = db.prepare('SELECT * FROM weather_queries WHERE id = ?').get(id);
    updated.weather_data = JSON.parse(updated.weather_data);

    res.json({
      message: 'Weather query updated successfully',
      data: updated,
      weather_refreshed: locationChanged || datesChanged,
    });
  } catch (err) {
    console.error('UPDATE /api/queries/:id error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ---------- DELETE (single by ID) ----------
// DELETE /api/queries/:id
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id must be a positive integer' });
    }

    // Confirm the record exists before deleting (so we can return a nice message)
    const existing = db.prepare('SELECT id, location, resolved_name FROM weather_queries WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: `No weather query found with id=${id}` });
    }

    db.prepare('DELETE FROM weather_queries WHERE id = ?').run(id);

    res.json({
      message: `Weather query deleted successfully`,
      deleted: existing,
    });
  } catch (err) {
    console.error('DELETE /api/queries/:id error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ---------- DELETE (all) ----------
// DELETE /api/queries
// Useful for "Clear history" or full-reset functionality.
router.delete('/', (req, res) => {
  try {
    const before = db.prepare('SELECT COUNT(*) AS count FROM weather_queries').get().count;
    db.prepare('DELETE FROM weather_queries').run();

    res.json({
      message: 'All weather queries deleted successfully',
      deleted_count: before,
    });
  } catch (err) {
    console.error('DELETE /api/queries error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;
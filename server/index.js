// server/index.js
// Entry point for the Weather App backend.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ---------- Middleware ----------
app.use(cors());              // allow requests from the React frontend
app.use(express.json());      // parse JSON request bodies

// ---------- Routes ----------

// Root: simple welcome message
app.get('/', (req, res) => {
  res.send('🌤️  Weather App Backend is running');
});

// Health check — useful for verifying the server is alive
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
  });
});

// DB sanity check: returns the count of stored weather queries
app.get('/api/db-check', (req, res) => {
  try {
    const row = db.prepare('SELECT COUNT(*) AS count FROM weather_queries').get();
    res.json({
      status: 'ok',
      table: 'weather_queries',
      total_records: row.count,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ---------- Routers ----------
const queriesRouter = require('./routes/queries');
app.use('/api/queries', queriesRouter);

const exportRouter = require('./routes/export');
app.use('/api/export', exportRouter);

// ---------- Start the server ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
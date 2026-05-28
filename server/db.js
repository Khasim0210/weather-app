// server/db.js
// SQLite database setup using better-sqlite3.

const Database = require('better-sqlite3');
const path = require('path');

// Database file lives at: server/weather.db
// On first run, better-sqlite3 will create the file automatically.
const dbPath = path.join(__dirname, 'weather.db');
const db = new Database(dbPath);

// Enable foreign keys (good practice for future-proofing).
db.pragma('foreign_keys = ON');

// ---------- Table: weather_queries ----------
// Stores every user request: a location + date range + the weather data we fetched.
db.exec(`
  CREATE TABLE IF NOT EXISTS weather_queries (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    location        TEXT    NOT NULL,
    resolved_name   TEXT,
    latitude        REAL,
    longitude       REAL,
    start_date      TEXT    NOT NULL,
    end_date        TEXT    NOT NULL,
    weather_data    TEXT    NOT NULL,
    notes           TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

console.log('✅ SQLite database ready at', dbPath);

module.exports = db;
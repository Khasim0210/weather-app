// server/routes/export.js
// Endpoints that export stored weather queries in various formats.

const express = require('express');
const PDFDocument = require('pdfkit');
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


// ---------- Helper: CSV escaping ----------
// Wraps a value in quotes if it contains commas, quotes, or newlines,
// and doubles any internal quotes (standard CSV rules).
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ---------- EXPORT: CSV ----------
// GET /api/export/csv
router.get('/csv', (req, res) => {
  try {
    const data = loadAllQueries();

    // Column headers
    const headers = [
      'id',
      'location',
      'resolved_name',
      'latitude',
      'longitude',
      'start_date',
      'end_date',
      'current_temp_c',
      'current_condition',
      'humidity_pct',
      'wind_mps',
      'notes',
      'created_at',
      'updated_at',
    ];

    // Build rows — extract a flat set of fields from the nested weather_data
    const rows = data.map((row) => {
      const current = row.weather_data?.current || {};
      const main = current.main || {};
      const weather = (current.weather && current.weather[0]) || {};
      const wind = current.wind || {};

      return [
        row.id,
        row.location,
        row.resolved_name,
        row.latitude,
        row.longitude,
        row.start_date,
        row.end_date,
        main.temp ?? '',
        weather.description ?? '',
        main.humidity ?? '',
        wind.speed ?? '',
        row.notes ?? '',
        row.created_at,
        row.updated_at,
      ].map(csvEscape).join(',');
    });

    // Combine headers + rows into final CSV text
    const csv = [headers.join(','), ...rows].join('\n');
    const filename = buildFilename('csv');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error('EXPORT /csv error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ---------- EXPORT: PDF ----------
// GET /api/export/pdf
router.get('/pdf', (req, res) => {
  try {
    const data = loadAllQueries();
    const filename = buildFilename('pdf');

    // Set headers BEFORE piping the PDF to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Create the PDF document and stream it to the client
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    doc.pipe(res);

    // ---------- Title block ----------
    doc.fontSize(24).fillColor('#1a73e8').text('Weather Queries Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666')
      .text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' })
      .text(`Total records: ${data.length}`, { align: 'center' });
    doc.moveDown(1.5);

    // ---------- Each record as its own block ----------
    if (data.length === 0) {
      doc.fontSize(12).fillColor('#000')
        .text('No weather queries saved yet.', { align: 'center' });
    } else {
      data.forEach((row, index) => {
        const current = row.weather_data?.current || {};
        const main = current.main || {};
        const weather = (current.weather && current.weather[0]) || {};
        const wind = current.wind || {};

        // Record header
        doc.fontSize(14).fillColor('#1a73e8')
          .text(`${index + 1}. ${row.resolved_name || row.location}`, { underline: false });
        doc.moveDown(0.3);

        // Record details
        doc.fontSize(10).fillColor('#000');
        const lines = [
          `Location query:      ${row.location}`,
          `Coordinates:         ${row.latitude}, ${row.longitude}`,
          `Date range:          ${row.start_date}  to  ${row.end_date}`,
          `Current temperature: ${main.temp ?? 'N/A'} °C   (feels like ${main.feels_like ?? 'N/A'} °C)`,
          `Condition:           ${weather.description ?? 'N/A'}`,
          `Humidity:            ${main.humidity ?? 'N/A'}%`,
          `Wind:                ${wind.speed ?? 'N/A'} m/s`,
          `Notes:               ${row.notes || '—'}`,
          `Created at:          ${row.created_at}`,
        ];
        lines.forEach((line) => doc.text(line));

        doc.moveDown(0.7);
        // Divider line
        doc.strokeColor('#ddd').lineWidth(0.5)
          .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.7);

        // Page break if running low on space (rough estimate)
        if (doc.y > 720 && index < data.length - 1) {
          doc.addPage();
        }
      });
    }

    // ---------- Footer on every page ----------
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#999')
        .text(
          `Weather App  ·  Page ${i + 1} of ${range.count}  ·  Built by Khasim Shaik`,
          50,
          doc.page.height - 35,
          { align: 'center', width: doc.page.width - 100 }
        );
    }

    doc.end();
  } catch (err) {
    console.error('EXPORT /pdf error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


module.exports = router;
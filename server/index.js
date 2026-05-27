// server/index.js
// Entry point for the Weather App backend.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// ---------- Start the server ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
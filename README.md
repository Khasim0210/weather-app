# 🌤️ Weather App — Full Stack

> A modern, full-stack weather application combining real-time forecasts, location-based search, persistent CRUD storage, third-party API integrations, and multi-format data export.
>
> Submitted as the **Technical Assessment for the AI Engineer Intern role at PM Accelerator** — covering both Tech Assessment #1 (Frontend) and Tech Assessment #2 (Backend) in a single full-stack submission.

**👤 Built by:** Khasim Shaik
**📍 Repository:** https://github.com/Khasim0210/weather-app
**🎓 Program:** PM Accelerator — AI Engineer Intern Assessment

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Setup & Installation](#-setup--installation)
6. [Running the App](#-running-the-app)
7. [API Endpoints](#-api-endpoints)
8. [Database Schema](#-database-schema)
9. [Assessment Requirements Coverage](#-assessment-requirements-coverage)
10. [Screenshots](#-screenshots)
11. [About PM Accelerator](#-about-pm-accelerator)
12. [Contact](#-contact)

---

## 🎯 Overview

This project is a **production-quality weather application** built to demonstrate full-stack engineering skills. It's split into two integrated pieces:

- **🎨 Frontend (Tech Assessment #1):** A polished React + Vite weather app that lets users search any location and view current weather plus a 5-day forecast.
- **⚙️ Backend (Tech Assessment #2):** A Node.js + Express + SQLite REST API that adds persistence (full CRUD), input validation, additional API integration (YouTube), and data export in three formats (JSON / CSV / PDF).

Both pieces are wired together with a tab-based UI — users can either look up live weather or manage a database of saved weather queries with rich actions like edit, delete, export, and view related YouTube travel videos.

---

## ✨ Features

### 🌍 Current Weather Page (Assessment #1)

- 🔍 **Flexible location search** — accepts city names, zip codes, and landmarks (e.g. "Eiffel Tower", "10001", "Mumbai")
- 📍 **Geolocation support** — "Use My Current Location" button fetches the user's coordinates from the browser
- 🌡️ **Detailed current weather** — temperature, "feels like", condition, humidity, wind speed, pressure, visibility
- 📅 **5-day forecast** — horizontal cards showing daily temps, conditions, and weather icons
- 🎨 **Dynamic backgrounds** — gradients change based on the current weather condition (clear, clouds, rain, thunder, snow, mist)
- 🧊 **Glassmorphism UI** — frosted glass cards with backdrop blur for a modern look
- 🛡️ **Graceful error handling** — friendly messages for 401 (bad key), 404 (location not found), 429 (rate limited), 5xx (service down), network errors, and geolocation permission denials

### 🗄️ Saved Queries Page (Assessment #2)

#### CRUD Operations
- ➕ **CREATE** — Save a location and date range. Validates the date range (start ≤ end, within ±1 year, ≤ 30 days). Validates the location via OpenWeatherMap geocoding (fuzzy match supported). Fetches and stores full weather data.
- 📖 **READ** — List all saved queries (with optional filter by location, sort by newest/oldest, and result limit). Get a single query by ID with full details.
- ✏️ **UPDATE** — Edit any field of a saved query. If location or dates change, weather data is **automatically re-fetched** to keep everything in sync.
- 🗑️ **DELETE** — Remove a single query (with confirmation) or bulk-delete all queries (useful for "Clear history").

#### Data Export (Section 2.3)
- 📄 **JSON export** — Pretty-printed JSON download with export timestamp and full record list
- 📊 **CSV export** — Spreadsheet-friendly with proper escaping (handles commas, quotes, newlines). Opens directly in Excel / Numbers / Google Sheets.
- 📑 **PDF export** — Polished, multi-page PDF report with title page, formatted record blocks, dividers, pagination, and footer attribution. Generated server-side using PDFKit.

#### Additional API Integration (Section 2.2)
- 🎬 **YouTube Data API v3 integration** — Each saved query has a "Show Videos" button that fetches 5 real travel videos for that location, complete with thumbnails, titles, channel names, and direct links to YouTube.

### 🎨 UI/UX Polish

- 🔀 **Tab navigation** — Toggle between "Current Weather" and "Saved Queries" without losing state
- 💎 **Rich cards** — Each saved query displays its current temperature, condition, humidity, wind, and a weather icon
- ✍️ **Inline editing** — Edit forms open directly inside the card; no modals or page navigation
- 🎯 **One-click exports** — Color-coded JSON/CSV/PDF buttons trigger direct file downloads
- ⚡ **Optimistic UI updates** — Lists refresh immediately after create/edit/delete operations
- 📱 **Responsive design** — Layout adapts to desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| ⚛️ **React 19** | UI library |
| ⚡ **Vite** | Lightning-fast dev server + build tool |
| 🎨 **Plain CSS** | Custom styling with glassmorphism + utility patterns |
| 🌐 **Fetch API** | HTTP requests to backend |

### Backend
| Technology | Purpose |
|---|---|
| 🟢 **Node.js 18+** | Runtime |
| 🚂 **Express 5** | Web framework |
| 🗃️ **SQLite (better-sqlite3)** | Embedded database, zero-config persistence |
| 📡 **Axios** | HTTP client for external API calls |
| 📑 **PDFKit** | Server-side PDF generation |
| 🔧 **CORS + dotenv** | Cross-origin requests + environment management |
| 🔄 **Nodemon** | Auto-restart on file changes (dev only) |

### External APIs
| API | Use case |
|---|---|
| ☀️ **OpenWeatherMap** | Current weather, 5-day forecast, geocoding (city → lat/lon, zip lookup) |
| 🎬 **YouTube Data API v3** | Search for travel videos by location name |

---

## 📁 Project Structure

```
weather-app/
├── public/                     # Static assets (favicon, icons)
├── src/                        # 🎨 React frontend
│   ├── App.jsx                 # Main app: tabs + Current Weather page
│   ├── SavedQueries.jsx        # Saved Queries page (CRUD + export + videos)
│   ├── api.js                  # Frontend HTTP client for /api/* endpoints
│   ├── App.css                 # All styling
│   ├── index.css               # Global resets
│   └── main.jsx                # React entry point
│
├── server/                     # ⚙️ Express backend
│   ├── index.js                # Server entry: middleware, routers, listen
│   ├── db.js                   # SQLite setup + schema creation
│   ├── weather.db              # SQLite database file (auto-generated, gitignored)
│   ├── routes/
│   │   ├── queries.js          # CRUD + YouTube endpoints
│   │   └── export.js           # JSON / CSV / PDF export endpoints
│   ├── services/
│   │   ├── weatherService.js   # OpenWeatherMap API calls (geocode + fetch)
│   │   └── youtubeService.js   # YouTube Data API v3 calls
│   ├── utils/
│   │   └── validators.js       # Date range + ISO date validation helpers
│   ├── .env                    # Backend secrets (gitignored)
│   └── package.json            # Backend dependencies
│
├── .env                        # Frontend secrets (gitignored)
├── .gitignore                  # Ignores node_modules, .env, *.db
├── vite.config.js              # Vite config with /api proxy → :3001
├── eslint.config.js
├── index.html
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

---

## 🚀 Setup & Installation

### Prerequisites

Make sure you have these installed:

- 🟢 **Node.js** v18 or higher — [download here](https://nodejs.org/)
- 📦 **npm** (comes with Node.js)
- 🔑 An **OpenWeatherMap API key** (free tier) — [sign up](https://openweathermap.org/api)
- 🎬 A **YouTube Data API v3 key** (free) — [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Khasim0210/weather-app.git
cd weather-app
```

### 2️⃣ Install frontend dependencies

```bash
npm install
```

### 3️⃣ Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4️⃣ Set up environment variables

You need **two** `.env` files — one for the frontend, one for the backend. Both are gitignored, so they stay on your machine only.

**Frontend** — at the project root, create a file called `.env`:

```env
VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
```

**Backend** — inside the `server/` folder, create a file called `.env`:

```env
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
PORT=3001
```

> 💡 **Tip:** Both can use the same OpenWeatherMap key. Get the YouTube key from Google Cloud Console after enabling the "YouTube Data API v3" library.

---

## ▶️ Running the App

You need **two terminals** running simultaneously.

### 🖥️ Terminal 1 — Backend

```bash
cd server
npm run dev
```

You should see:
```
✅ SQLite database ready at /.../server/weather.db
✅ Server running on http://localhost:3001
```

The backend listens on **port 3001**.

### 🖥️ Terminal 2 — Frontend

```bash
npm run dev
```

You should see:
```
VITE v8.x.x  ready in 600 ms
➜  Local:   http://localhost:5173/
```

The frontend runs on **port 5173**. Open it in your browser.

### 🎮 Try it out

1. The **Current Weather** tab is loaded by default — try searching "Hyderabad" or click "Use My Current Location"
2. Switch to **Saved Queries** to see the CRUD + export + videos features
3. Click **Show Videos** on any saved query card to fetch live YouTube travel videos

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api`. The Vite dev proxy automatically forwards requests from `localhost:5173/api/*` to `localhost:3001/api/*`.

### 🩺 Health checks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Confirms backend is alive |
| GET | `/api/db-check` | Returns total record count in the database |

### 📋 CRUD — Weather Queries

| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/api/queries` | Create a new saved query. Body: `{ location, start_date, end_date, notes? }` |
| **GET** | `/api/queries` | List all queries. Query params: `?location=`, `?sort=newest\|oldest`, `?limit=` |
| **GET** | `/api/queries/:id` | Get one query by ID |
| **PUT** | `/api/queries/:id` | Update a query. Auto-refetches weather if location/dates change. |
| **DELETE** | `/api/queries/:id` | Delete one query by ID |
| **DELETE** | `/api/queries` | Bulk delete (clear all queries) |

### 🎬 YouTube Integration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/queries/:id/videos` | Fetch 5 travel videos for the saved query's location |

### 📥 Data Export

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/export/json` | Download all queries as a JSON file |
| GET | `/api/export/csv` | Download all queries as CSV (spreadsheet-ready) |
| GET | `/api/export/pdf` | Download all queries as a formatted PDF report |

### 🧪 Example: Create a query via curl

```bash
curl -X POST http://localhost:3001/api/queries \
  -H "Content-Type: application/json" \
  -d '{"location": "Hyderabad", "start_date": "2026-06-01", "end_date": "2026-06-05"}'
```

---

## 🗄️ Database Schema

SQLite table `weather_queries`:

| Column | Type | Purpose |
|---|---|---|
| `id` | INTEGER PK | Auto-incrementing unique ID |
| `location` | TEXT | Original user input (e.g. "Hyderabad", "10001") |
| `resolved_name` | TEXT | Canonical name from OpenWeatherMap (e.g. "Hyderabad, IN") |
| `latitude` | REAL | Resolved latitude |
| `longitude` | REAL | Resolved longitude |
| `start_date` | TEXT | ISO date `YYYY-MM-DD` |
| `end_date` | TEXT | ISO date `YYYY-MM-DD` |
| `weather_data` | TEXT | Full OpenWeatherMap response, stored as JSON string |
| `notes` | TEXT | Optional user note (editable via UPDATE) |
| `created_at` | TEXT | Auto-set timestamp |
| `updated_at` | TEXT | Updated on every PUT |

The DB file (`server/weather.db`) is auto-created on first server start. It's gitignored so each clone starts with a fresh, empty database.

---

## ✅ Assessment Requirements Coverage

### Tech Assessment #1 — Frontend

| Requirement | Status | Where |
|---|---|---|
| Search by city / zip / landmark / coordinates | ✅ | `src/App.jsx` |
| Current weather display | ✅ | `src/App.jsx` |
| Geolocation support | ✅ | `handleUseLocation()` in `App.jsx` |
| Icons & visual design | ✅ | OpenWeatherMap icons + dynamic backgrounds |
| 5-day forecast (Stand Apart) | ✅ | `src/App.jsx` forecast section |
| Error handling (Stand Apart) | ✅ | `getFriendlyError()` in `App.jsx` |
| Real-time data (no static) | ✅ | OpenWeatherMap API |

### Tech Assessment #2 — Backend

| Requirement | Status | Where |
|---|---|---|
| CREATE with date + location validation | ✅ | `POST /api/queries` |
| READ stored queries | ✅ | `GET /api/queries` and `GET /api/queries/:id` |
| UPDATE with re-validation | ✅ | `PUT /api/queries/:id` |
| DELETE | ✅ | `DELETE /api/queries/:id` and `DELETE /api/queries` |
| Database persistence | ✅ | SQLite at `server/weather.db` |
| Additional API integration (Stand Apart) | ✅ | YouTube Data API — `/api/queries/:id/videos` |
| Data export to multiple formats | ✅ | JSON / CSV / PDF — `/api/export/*` |

### Bonus

| Item | Status |
|---|---|
| Full Stack submission (both #1 and #2) | ✅ |
| Polished, designer-ready UI | ✅ |
| Public GitHub repo with clean commit history | ✅ |
| Comprehensive README | ✅ |
| Author name in app | ✅ Footer |
| PM Accelerator info in app | ✅ Expandable footer section |

---

## 📸 Screenshots

> Screenshots are best viewed by running the app locally — see [Running the App](#-running-the-app).

Key views to explore:
- 🌤️ **Current Weather page** — search bar, weather card, 5-day forecast
- 🗂️ **Saved Queries page** — form, export buttons, rich cards
- ✏️ **Inline edit form** — click Edit on any card
- 🎬 **YouTube video grid** — click Show Videos on any card
- 📑 **Exported PDF report** — click PDF button

---

## 🎓 About PM Accelerator

The **Product Manager Accelerator Program** is designed to support PM professionals through every stage of their careers. From students looking for entry-level jobs to Directors looking to take on a leadership role, the program has helped hundreds of students fulfill their career aspirations.

PM Accelerator provides:
- 🎯 **Career coaching** from senior PMs at top tech companies
- 🛠️ **Hands-on projects** that build real-world portfolios
- 🤝 **A supportive community** of aspiring and current product managers
- 📚 **Curriculum** covering product strategy, analytics, AI/ML for PMs, and more

**🔗 Learn more:** https://www.linkedin.com/school/pmaccelerator/

---

## 📬 Contact

**👤 Khasim Shaik**
🔗 GitHub: [@Khasim0210](https://github.com/Khasim0210)
📁 Project: [weather-app](https://github.com/Khasim0210/weather-app)

---


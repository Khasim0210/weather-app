# 🌤️ Weather App

A modern, responsive weather application built with **React** and **Vite** that provides real-time weather information and a 5-day forecast for any location worldwide. Designed with a focus on user experience, clean code, and robust error handling.

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tech Stack](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript&logoColor=black)
![API](https://img.shields.io/badge/OpenWeatherMap-API-EB6E4B?logo=openweathermap)

---

## ✨ Features

### Core Functionality
- 🔍 **Flexible Location Search** — Search by city name, zip/postal code, or landmark
- 📍 **Geolocation Support** — One-click access to weather for your current location using the browser's Geolocation API
- 🌡️ **Detailed Current Weather** — Temperature, "feels like", condition, humidity, wind speed, pressure, and visibility
- 📅 **5-Day Forecast** — Daily weather predictions with icons, temperatures, and conditions
- 🎨 **Dynamic Backgrounds** — Background gradient changes based on weather conditions (sunny, cloudy, rainy, snowy, etc.)

### User Experience
- 🌈 **Modern Glassmorphism Design** — Frosted-glass cards with smooth blur effects
- ✨ **Smooth Animations** — Fade-in transitions, floating weather icons, and hover effects
- ⏳ **Loading States** — Animated spinner during API requests
- 📱 **Fully Responsive** — Optimized for desktop, tablet, and mobile devices
- ⌨️ **Keyboard Support** — Press Enter to search

### Error Handling
- ⚠️ Friendly error messages for common scenarios:
  - City/location not found (404)
  - Invalid API key (401)
  - Rate limit exceeded (429)
  - Network failures
  - Geolocation denied or unavailable
  - Server errors (5xx)
- 🛡️ Graceful degradation — current weather displays even if the 5-day forecast fails

---

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vitejs.dev/) |
| Language | JavaScript (ES2024) |
| Styling | CSS3 (Glassmorphism, Flexbox, Grid, Animations) |
| Weather Data | [OpenWeatherMap API](https://openweathermap.org/api) |
| Geolocation | Browser Geolocation API |
| Linting | ESLint |

---

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v20.19+ or v22.12+
- A free [OpenWeatherMap API key](https://home.openweathermap.org/api_keys)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Khasim0210/weather-app.git
   cd weather-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root and add your OpenWeatherMap API key:
   ```
   VITE_WEATHER_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Build for Production

```bash
npm run build
```

The optimized production build will be generated in the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

---

## 📂 Project Structure

```
weather-app/
├── public/                 # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.jsx             # Main React component (logic + UI)
│   ├── App.css             # Component-specific styles
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables (gitignored)
├── .gitignore
├── index.html              # HTML entry point
├── package.json
├── vite.config.js          # Vite configuration
└── README.md
```

---

## 🔑 Key Technical Decisions

### Why React + Vite?
- **React** offers a component-based architecture with excellent state management via hooks (`useState`)
- **Vite** provides lightning-fast development builds and hot module replacement (HMR)

### Parallel API Requests
Current weather and forecast data are fetched **simultaneously** using `Promise.all()` to reduce overall load time.

```javascript
const [weatherRes, forecastRes] = await Promise.all([
  fetch(weatherUrl),
  fetch(forecastUrl),
])
```

### Environment Variables
API keys are stored in a `.env` file (gitignored) and accessed via `import.meta.env.VITE_WEATHER_API_KEY` — following Vite's secure environment variable conventions.

### Forecast Filtering
OpenWeatherMap's free tier returns forecast data in 3-hour intervals (40 entries over 5 days). The app filters these to display one entry per day at 12:00 PM for a clean, daily summary.

---

## 🌐 API Endpoints Used

- **Current Weather:** `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast:** `https://api.openweathermap.org/data/2.5/forecast`
- **Weather Icons:** `https://openweathermap.org/img/wn/{icon_code}@2x.png`

Supported query parameters:
- `q={city name}` — Search by city/landmark
- `lat={lat}&lon={lon}` — Search by coordinates
- `units=metric` — Returns Celsius (configurable to imperial for Fahrenheit)

---

## 🎨 Design Highlights

- **Dynamic theming** based on weather conditions (clear, clouds, rain, thunder, snow, mist)
- **Glassmorphism cards** with backdrop blur for a modern, layered look
- **Responsive grid layout** that adapts gracefully from mobile to desktop
- **Subtle motion design** — fade-in animations on data load, floating weather icons, hover lifts on cards
- **Accessibility-friendly** — semantic HTML, alt text on weather icons, keyboard support

---

## 🧪 Testing the App

Try these scenarios to see the app in action:

| Test Case | Expected Result |
|-----------|----------------|
| Search "Dallas" | Shows weather for Dallas, US with appropriate background |
| Search "Tokyo" | International search works correctly |
| Search "75201" | Zip code search returns the corresponding city |
| Click "Use My Current Location" | Prompts for permission, then shows local weather |
| Search "xyzabc123" | Displays friendly "location not found" error |
| Empty input + Search | Displays "Please enter a city name" |
| Disconnect internet, then search | Displays network error |

---

## 🔮 Possible Future Enhancements

- 🌡️ Unit toggle (Celsius ↔ Fahrenheit)
- 🌅 Sunrise/sunset times
- 🗺️ Interactive weather map
- 📊 Hourly forecast graph
- 💾 Save favorite locations
- 🌙 Light/dark theme toggle
- 🌍 Multi-language support

---

## 👨‍💻 Author

**Khasim Shaik**
- GitHub: [@Khasim0210](https://github.com/Khasim0210)
- Email: shaikkhasim0210@gmail.com

---

## 📝 License

This project was built as part of a frontend engineering technical assessment.

---

## 🙏 Acknowledgments

- Weather data and icons provided by [OpenWeatherMap](https://openweathermap.org/)
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
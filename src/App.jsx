import { useState } from 'react'
import './App.css'
import SavedQueries from './SavedQueries'

function App() {
  const [view, setView] = useState('weather')   // 'weather' or 'saved'
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

  const getFriendlyError = (status, apiMessage) => {
    if (status === 401) return 'Invalid API key. Please check your configuration.'
    if (status === 404) return `We couldn't find that location. Please check the spelling and try again.`
    if (status === 429) return 'Too many requests. Please wait a moment and try again.'
    if (status >= 500) return 'Weather service is temporarily unavailable. Please try again later.'
    return apiMessage || 'Something went wrong. Please try again.'
  }

  const fetchWeatherByQuery = async (queryString) => {
    if (!API_KEY) {
      setError('API key is missing. Please set VITE_WEATHER_API_KEY in your .env file.')
      return
    }

    setLoading(true)
    setError('')
    setWeather(null)
    setForecast(null)

    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?${queryString}&appid=${API_KEY}&units=metric`
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${queryString}&appid=${API_KEY}&units=metric`

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl),
      ])

      const weatherData = await weatherRes.json()
      const forecastData = await forecastRes.json()

      if (!weatherRes.ok) {
        setError(getFriendlyError(weatherRes.status, weatherData.message))
        return
      }

      if (!forecastRes.ok) {
        setWeather(weatherData)
        setError('Could not load the 5-day forecast, but current weather is shown.')
        return
      }

      setWeather(weatherData)
      const daily = forecastData.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
      )
      setForecast(daily)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Network error. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!city.trim()) {
      setError('Please enter a city name.')
      setWeather(null)
      setForecast(null)
      return
    }
    fetchWeatherByQuery(`q=${encodeURIComponent(city.trim())}`)
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please search by city instead.')
      return
    }

    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchWeatherByQuery(`lat=${latitude}&lon=${longitude}`)
      },
      (err) => {
        let message = 'Could not get your location.'
        if (err.code === 1) message = 'Location access denied. Please allow location access or search by city.'
        else if (err.code === 2) message = 'Location unavailable. Please try again or search by city.'
        else if (err.code === 3) message = 'Location request timed out. Please try again.'
        setError(message)
        setLoading(false)
      }
    )
  }

  const getBackgroundClass = () => {
    if (!weather) return 'bg-default'
    const main = weather.weather[0].main.toLowerCase()
    if (main.includes('clear')) return 'bg-clear'
    if (main.includes('cloud')) return 'bg-clouds'
    if (main.includes('rain') || main.includes('drizzle')) return 'bg-rain'
    if (main.includes('thunder')) return 'bg-thunder'
    if (main.includes('snow')) return 'bg-snow'
    if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return 'bg-mist'
    return 'bg-default'
  }

  return (
    <div className={`app ${getBackgroundClass()}`}>
      <div className="container">
        <header className="header">
          <h1>🌤️ Weather App</h1>
          <p className="subtitle">Discover weather anywhere in the world</p>
        </header>

        {/* Tab navigation */}
        <div className="tab-bar">
          <button
            className={`tab ${view === 'weather' ? 'active' : ''}`}
            onClick={() => setView('weather')}
          >
            Current Weather
          </button>
          <button
            className={`tab ${view === 'saved' ? 'active' : ''}`}
            onClick={() => setView('saved')}
          >
            Saved Queries
          </button>
        </div>

        {/* Saved Queries view (backend-powered) */}
        {view === 'saved' && <SavedQueries />}

        {/* Weather view */}
        {view === 'weather' && (
          <>
            <div className="search-section">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search city, zip code, or landmark..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                />
                <button className="btn-primary" onClick={handleSearch} disabled={loading}>
                  {loading ? '⏳' : '🔍'} Search
                </button>
              </div>
              <button className="btn-location" onClick={handleUseLocation} disabled={loading}>
                📍 Use My Current Location
              </button>
            </div>

            {error && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {loading && !weather && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Fetching weather data...</p>
              </div>
            )}

            {weather && (
              <div className="weather-card glass">
                <div className="weather-header">
                  <div>
                    <h2>{weather.name}, {weather.sys?.country}</h2>
                    <p className="weather-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <img
                    className="weather-icon-main"
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                    alt={weather.weather[0].description}
                  />
                </div>

                <div className="temp-section">
                  <h1 className="big-temp">{Math.round(weather.main.temp)}°</h1>
                  <p className="condition">{weather.weather[0].description}</p>
                  <p className="feels-like">Feels like {Math.round(weather.main.feels_like)}°C</p>
                </div>

                <div className="details-grid">
                  <div className="detail-card">
                    <span className="detail-icon">💧</span>
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{weather.main.humidity}%</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-icon">💨</span>
                    <span className="detail-label">Wind</span>
                    <span className="detail-value">{weather.wind.speed} m/s</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-icon">🌡️</span>
                    <span className="detail-label">Pressure</span>
                    <span className="detail-value">{weather.main.pressure} hPa</span>
                  </div>
                  <div className="detail-card">
                    <span className="detail-icon">👁️</span>
                    <span className="detail-label">Visibility</span>
                    <span className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</span>
                  </div>
                </div>
              </div>
            )}

            {forecast && forecast.length > 0 && (
              <div className="forecast-section">
                <h3>📅 5-Day Forecast</h3>
                <div className="forecast-list">
                  {forecast.map((day) => (
                    <div key={day.dt} className="forecast-card glass">
                      <p className="forecast-day">
                        {new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: 'short' })}
                      </p>
                      <p className="forecast-date">
                        {new Date(day.dt_txt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                        alt={day.weather[0].description}
                      />
                      <p className="forecast-temp">{Math.round(day.main.temp)}°C</p>
                      <p className="forecast-desc">{day.weather[0].description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <footer className="footer">
          <p>Built by <strong>Khasim Shaik</strong> · Powered by OpenWeatherMap & YouTube Data API</p>
          <details className="pm-info">
            <summary>About PM Accelerator</summary>
            <p>
              The <strong>Product Manager Accelerator Program</strong> is designed to support PM
              professionals through every stage of their careers. From students looking for entry-level
              jobs to Directors looking to take on a leadership role, the program has helped hundreds
              of students fulfill their career aspirations. PMA provides career coaching, hands-on
              projects, and a supportive community to help PMs land roles at top tech companies.
            </p>
            <p>
              <a
                href="https://www.linkedin.com/company/pm-accelerator/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit PM Accelerator on LinkedIn
              </a>
            </p>
          </details>
        </footer>
      </div>
    </div>
  )
}

export default App
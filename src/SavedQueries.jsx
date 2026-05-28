// src/SavedQueries.jsx
// Backend-powered features: create, list, update, delete saved weather queries.

import { useState, useEffect } from 'react';
import { api } from './api';

export default function SavedQueries() {
  const [queries, setQueries] = useState([]);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing queries when the component mounts
  useEffect(() => {
    loadQueries();
  }, []);

  async function loadQueries() {
    try {
      const data = await api.listQueries();
      setQueries(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!location || !startDate || !endDate) {
      setError('Please fill in location, start date, and end date.');
      return;
    }

    setLoading(true);
    try {
      await api.createQuery({
        location,
        start_date: startDate,
        end_date: endDate,
      });
      setSuccess(`Saved weather query for "${location}"!`);
      setLocation('');
      setStartDate('');
      setEndDate('');
      loadQueries(); // refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="saved-queries">
      <h2>Saved Weather Queries</h2>
      <p className="subtitle">
        Save a location and date range. Weather data is fetched and stored in the database.
      </p>

      {/* CREATE form */}
      <form className="query-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Location (city, zip, landmark...)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <label>
          Start date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Query'}
        </button>
      </form>

      {error && <div className="msg error">{error}</div>}
      {success && <div className="msg success">{success}</div>}

      {/* Basic list (we'll make this richer in the next steps) */}
      <div className="query-count">{queries.length} saved {queries.length === 1 ? 'query' : 'queries'}</div>
      <ul className="query-list">
        {queries.map((q) => (
          <li key={q.id} className="query-item">
            <strong>{q.resolved_name || q.location}</strong>
            <span> · {q.start_date} → {q.end_date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
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

  // Track which card is being edited, and the edit form values
  const [editingId, setEditingId] = useState(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editNotes, setEditNotes] = useState('');

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
      await api.createQuery({ location, start_date: startDate, end_date: endDate });
      setSuccess(`Saved weather query for "${location}"!`);
      setLocation('');
      setStartDate('');
      setEndDate('');
      loadQueries();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete the saved query for "${name}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.deleteQuery(id);
      setSuccess(`Deleted query for "${name}".`);
      loadQueries();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(q) {
    setEditingId(q.id);
    setEditStart(q.start_date);
    setEditEnd(q.end_date);
    setEditNotes(q.notes || '');
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleUpdate(id) {
    setError('');
    setSuccess('');
    try {
      await api.updateQuery(id, {
        start_date: editStart,
        end_date: editEnd,
        notes: editNotes,
      });
      setSuccess('Query updated successfully.');
      setEditingId(null);
      loadQueries();
    } catch (err) {
      setError(err.message);
    }
  }

  // Helper: pull the current temp + condition out of the stored weather_data
  function getCurrent(q) {
    const cur = q.weather_data?.current;
    if (!cur) return null;
    return {
      temp: Math.round(cur.main?.temp),
      desc: cur.weather?.[0]?.description || '',
      icon: cur.weather?.[0]?.icon,
      humidity: cur.main?.humidity,
      wind: cur.wind?.speed,
    };
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

      {/* Export toolbar */}
      <div className="export-bar">
        <span className="export-label">Export data:</span>
        <a className="export-btn json" href={api.exportUrl('json')}>JSON</a>
        <a className="export-btn csv" href={api.exportUrl('csv')}>CSV</a>
        <a className="export-btn pdf" href={api.exportUrl('pdf')}>PDF</a>
      </div>

      <div className="query-count">
        {queries.length} saved {queries.length === 1 ? 'query' : 'queries'}
      </div>

      {/* Rich cards */}
      <div className="query-cards">
        {queries.map((q) => {
          const cur = getCurrent(q);
          const isEditing = editingId === q.id;
          return (
            <div key={q.id} className="query-card glass">
              <div className="query-card-header">
                <div>
                  <h3>{q.resolved_name || q.location}</h3>
                  <p className="query-dates">{q.start_date} → {q.end_date}</p>
                </div>
                {cur?.icon && (
                  <img
                    className="query-card-icon"
                    src={`https://openweathermap.org/img/wn/${cur.icon}@2x.png`}
                    alt={cur.desc}
                  />
                )}
              </div>

              {cur && (
                <div className="query-card-weather">
                  <span className="query-temp">{cur.temp}°C</span>
                  <span className="query-desc">{cur.desc}</span>
                  <span className="query-meta">💧 {cur.humidity}% · 💨 {cur.wind} m/s</span>
                </div>
              )}

              {q.notes && !isEditing && <p className="query-notes">📝 {q.notes}</p>}

              {/* Edit form (inline) */}
              {isEditing ? (
                <div className="query-edit">
                  <label>
                    Start date
                    <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
                  </label>
                  <label>
                    End date
                    <input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
                  </label>
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                  <div className="query-actions">
                    <button className="btn-save" onClick={() => handleUpdate(q.id)}>Save</button>
                    <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="query-actions">
                  <button className="btn-edit" onClick={() => startEdit(q)}>✏️ Edit</button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(q.id, q.resolved_name || q.location)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
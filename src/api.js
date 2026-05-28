// src/api.js
// Small helper for talking to the backend API.

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // CRUD
  listQueries: () => request('/queries'),
  getQuery: (id) => request(`/queries/${id}`),
  createQuery: (body) => request('/queries', { method: 'POST', body: JSON.stringify(body) }),
  updateQuery: (id, body) => request(`/queries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteQuery: (id) => request(`/queries/${id}`, { method: 'DELETE' }),

  // YouTube
  getVideos: (id) => request(`/queries/${id}/videos`),

  // Export URLs (these are direct links, not fetch calls)
  exportUrl: (format) => `/api/export/${format}`,
};
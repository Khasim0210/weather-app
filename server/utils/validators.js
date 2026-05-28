// server/utils/validators.js
// Input validation helpers.

/**
 * Validate a YYYY-MM-DD date string.
 * Returns a Date object if valid, null otherwise.
 */
function parseISODate(str) {
  if (!str || typeof str !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(`${str}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Validate a date range: start_date and end_date.
 * Rules:
 *  - Both must be valid ISO dates (YYYY-MM-DD)
 *  - start_date <= end_date
 *  - Range cannot exceed 30 days
 *  - Dates cannot be more than 1 year in the past or future
 *
 * Returns { valid: true } or { valid: false, error: '...' }.
 */
function validateDateRange(start_date, end_date) {
  const start = parseISODate(start_date);
  const end = parseISODate(end_date);

  if (!start) return { valid: false, error: 'start_date must be in YYYY-MM-DD format' };
  if (!end) return { valid: false, error: 'end_date must be in YYYY-MM-DD format' };
  if (start > end) return { valid: false, error: 'start_date must be on or before end_date' };

  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > 30) return { valid: false, error: 'Date range cannot exceed 30 days' };

  const now = new Date();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  if (Math.abs(start - now) > oneYearMs || Math.abs(end - now) > oneYearMs) {
    return { valid: false, error: 'Dates must be within 1 year of today' };
  }

  return { valid: true };
}

module.exports = { parseISODate, validateDateRange };
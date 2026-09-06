/** Shared display helpers. Dates are rendered in UTC so a server render and a
 *  client hydration never disagree about the day. */

const DATE_OPTS = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
const DATETIME_OPTS = { ...DATE_OPTS, hour: 'numeric', minute: '2-digit' };

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', DATE_OPTS);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US', DATETIME_OPTS);
}

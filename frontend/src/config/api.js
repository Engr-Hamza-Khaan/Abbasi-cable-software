const DEFAULT_API_BASE = 'http://localhost:5000/api';

/** Full API base URL, e.g. http://localhost:5000/api — set via VITE_API_URL in .env */
export const API_BASE = (
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE
).replace(/\/$/, '');

console.log('API_URL', API_BASE);

/** Socket.io server origin (host without /api path) */
export const SOCKET_ORIGIN = API_BASE.replace(/\/api\/?$/i, '') || 'http://localhost:5000';

/** Build a full API URL from a path segment, e.g. apiUrl('/shops') */
export const apiUrl = (path = '') => {
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${segment}`;
};

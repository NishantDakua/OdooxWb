// Central API client. Talks to the real Express backend and attaches the JWT
// from the existing auth flow (localStorage 'token', set by the real login).
// Backend responds with { success, data } or { success:false, message }.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function buildUrl(path, query) {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function authHeader() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = 'GET', body, query, headers } = {}) {
  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection and try again.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }

  // Endpoints return { success, data }. Fall back to the whole payload if not.
  return payload && 'data' in payload ? payload.data : payload;
}

export const api = {
  get: (path, query) => request(path, { method: 'GET', query }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
};

// Legacy helpers kept for any existing imports.
export function apiUrl(path) {
  return buildUrl(path);
}
export async function apiFetch(path, options = {}) {
  return fetch(buildUrl(path), options);
}

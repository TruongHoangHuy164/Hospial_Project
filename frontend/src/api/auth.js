const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getTokens() {
  return {
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
  };
}

function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const tokens = getTokens();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (tokens.accessToken) headers['Authorization'] = `Bearer ${tokens.accessToken}`;

  let res = await fetch(url, { ...options, headers });
  if (res.status === 401 && tokens.refreshToken && path !== '/api/auth/refresh') {
    // try refresh
    const r = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (r.ok) {
      const data = await r.json();
      setTokens(data);
      // retry original
      const retryHeaders = { ...headers, Authorization: `Bearer ${data.accessToken}` };
      res = await fetch(url, { ...options, headers: retryHeaders });
    } else {
      clearTokens();
    }
  }
  return res;
}

export async function register(name, email, password) {
  const res = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw await res.json();
  const data = await res.json();
  setTokens(data);
  return data.user;
}

export async function login(email, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await res.json();
  const data = await res.json();
  setTokens(data);
  return data.user;
}

export async function logout() {
  const { refreshToken } = getTokens();
  if (refreshToken) {
    await request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }
  clearTokens();
}

export async function getProfile() {
  const res = await request('/api/profile');
  if (!res.ok) throw await res.json();
  return res.json();
}

export function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

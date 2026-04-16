export const API_BASE_URL =
  process.env.REACT_APP_DOCTOR_API_URL || 'http://localhost:5002/api';

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token } = options;
  const headers = body ? { 'Content-Type': 'application/json' } : {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : {};

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

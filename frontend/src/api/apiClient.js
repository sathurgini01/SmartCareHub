export const API_BASE_URL =
  process.env.REACT_APP_DOCTOR_API_URL || 'http://localhost:5010/api';

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token } = options;
  const headers = body ? { 'Content-Type': 'application/json' } : {};

  // Path adjustments
  let finalPath = path;
  if (path.startsWith('/api')) {
    finalPath = path.substring(4);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${finalPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const raw = await response.text();
  let data = {};
  
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch (e) {
      // Handle the case where response is not JSON (e.g. gateway HTML error)
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${raw.substring(0, 100)}...`);
      }
      throw new Error('Received non-JSON response from server');
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

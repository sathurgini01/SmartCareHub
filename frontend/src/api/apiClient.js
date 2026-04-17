export const API_BASE_URL =
  process.env.REACT_APP_DOCTOR_API_URL || '';

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token } = options;
  const headers = body ? { 'Content-Type': 'application/json' } : {};

  let finalPath = path;
  if (!API_BASE_URL && !path.startsWith('/api')) {
    finalPath = `/api${path}`;
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
  const contentType = response.headers.get('content-type') || '';
  let data = {};

  if (raw) {
    if (contentType.includes('application/json')) {
      data = JSON.parse(raw);
    } else {
      try {
        data = JSON.parse(raw);
      } catch (_error) {
        data = { message: raw };
      }
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

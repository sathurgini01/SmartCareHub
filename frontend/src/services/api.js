import axios from 'axios';

/**
 * Relative base URL — no hardcoded host.
 *  • Local dev  : setupProxy.js forwards /api/patients → localhost:5002
 *  • Docker / K8s: nginx inside the frontend container proxies the same paths
 */
const api = axios.create({
  baseURL: '/api', // Correctly prefix all microservice calls with /api for proxying
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('smartcare-platform-session');
      
      // Don't redirect if already on login-related page
      const isLoginPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/auth');
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

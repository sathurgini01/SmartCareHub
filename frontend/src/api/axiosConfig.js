import axios from 'axios';

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        sessionStorage.removeItem('smartcare-platform-session');
        localStorage.removeItem('smartcare-platform-session');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );
  return instance;
};

// Use CRA/nginx proxy paths so local development and container deployment behave the same.
export const authAPI         = createInstance('/api/auth');
export const telemedicineAPI = createInstance('/api/telemedicine');
export const notificationAPI = createInstance('/api/notifications');
export const aiSymptomAPI    = createInstance('/api/ai-symptom');

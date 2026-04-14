import axios from 'axios';

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );
  return instance;
};

// Port 5001 - Patient/Auth Service (update if different)
export const authAPI         = createInstance('http://localhost:5001/api');
// Port 5004 - Telemedicine Service
export const telemedicineAPI = createInstance('http://localhost:5004/api/telemedicine');
// Port 5005 - Notification Service
export const notificationAPI = createInstance('http://localhost:5005/api/notifications');
// Port 5006 - AI Symptom Service
export const aiSymptomAPI    = createInstance('http://localhost:5006/api/ai-symptom');

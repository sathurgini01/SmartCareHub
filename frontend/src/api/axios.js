import axios from 'axios';
import { clearSession, getAccessToken } from '../services/storage';

const instance = axios.create();

instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;

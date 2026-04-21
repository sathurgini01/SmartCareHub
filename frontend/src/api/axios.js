import axios from 'axios';

const instance = axios.create();

instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
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
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('smartcare-platform-session');
      sessionStorage.removeItem('smartcare-platform-session');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;

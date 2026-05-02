import axios from './axios';

const GATEWAY_URL = 'http://localhost:5000/api';

export const login = (data) => {
  let url = `${GATEWAY_URL}/auth/login`;
  if (data.role === 'doctor') {
    url = `${GATEWAY_URL}/doctors/auth/login`;
  } else if (data.role === 'admin') {
    url = `${GATEWAY_URL}/doctors/auth/admin/login`;
  }
  return axios.post(url, data);
};

export const register = (data) => {
  let url = `${GATEWAY_URL}/auth/register`;
  if (data.role === 'doctor') {
    url = `${GATEWAY_URL}/doctors/auth/register`;
  } else if (data.role === 'admin') {
    url = `${GATEWAY_URL}/doctors/auth/admin/register`;
  }
  return axios.post(url, data);
};

export const getProfile = () => axios.get(`${GATEWAY_URL}/auth/me`);

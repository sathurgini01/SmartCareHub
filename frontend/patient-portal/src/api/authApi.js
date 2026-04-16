import axios from './axios';

const AUTH_BASE_URL = 'http://localhost:5001/api/auth';

export const login = (data) => axios.post(`${AUTH_BASE_URL}/login`, data);
export const register = (data) => axios.post(`${AUTH_BASE_URL}/register`, data);
export const getProfile = () => axios.get(`${AUTH_BASE_URL}/profile`);

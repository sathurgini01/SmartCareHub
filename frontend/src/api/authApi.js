import { authAPI } from './axiosConfig';

export const login = (data) =>
  authAPI.post('/auth/login', data);

export const register = (data) =>
  authAPI.post('/auth/register', data);

export const getProfile = () =>
  authAPI.get('/auth/profile');

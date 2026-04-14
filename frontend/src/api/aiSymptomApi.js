import { aiSymptomAPI } from './axiosConfig';

export const checkSymptoms = (data) =>
  aiSymptomAPI.post('/check', data);

export const getSymptomHistory = () =>
  aiSymptomAPI.get('/history');

export const getAdminLogs = () =>
  aiSymptomAPI.get('/admin/logs');

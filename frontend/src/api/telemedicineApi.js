import { telemedicineAPI } from './axiosConfig';

export const getSessionByAppointment = (appointmentId) =>
  telemedicineAPI.get(`/sessions/appointment/${appointmentId}`);

export const joinSession = (sessionId) =>
  telemedicineAPI.post(`/sessions/${sessionId}/join`);

export const endSession = (sessionId) =>
  telemedicineAPI.patch(`/sessions/${sessionId}/end`);

export const cancelSession = (sessionId) =>
  telemedicineAPI.patch(`/sessions/${sessionId}/cancel`);

export const getMySessions = () =>
  telemedicineAPI.get('/my-sessions');

export const getAdminLogs = () =>
  telemedicineAPI.get('/admin/logs');

import { telemedicineAPI } from './axiosConfig';

export const getSessionByAppointment = (appointmentId) =>
  telemedicineAPI.get(`/sessions/appointment/${appointmentId}`);

// role must be 'doctor' or 'patient' — backend requires it in body
export const joinSession = (sessionId, role) =>
  telemedicineAPI.post(`/sessions/${sessionId}/join`, { role });

export const endSession = (sessionId) =>
  telemedicineAPI.patch(`/sessions/${sessionId}/end`);

export const cancelSession = (sessionId) =>
  telemedicineAPI.patch(`/sessions/${sessionId}/cancel`);

// Backend requires ?role=doctor|patient&userId=xxx
export const getMySessions = (role, userId) =>
  telemedicineAPI.get('/my-sessions', { params: { role, userId } });

export const getAdminLogs = () =>
  telemedicineAPI.get('/admin/logs');

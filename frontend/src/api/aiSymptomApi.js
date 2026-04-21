import { aiSymptomAPI } from './axiosConfig';

// Backend requires patientId in body
export const checkSymptoms = (patientId, formData) =>
  aiSymptomAPI.post('/check', {
    patientId,
    symptoms:        formData.symptoms,
    age:             formData.age,
    gender:          formData.gender,
    duration:        formData.duration,
    additionalNotes: formData.notes,   // frontend field 'notes' → backend field 'additionalNotes'
  });

// Backend requires ?patientId=xxx
export const getSymptomHistory = (patientId) =>
  aiSymptomAPI.get('/history', { params: { patientId } });

export const getSymptomHistoryById = (analysisId) =>
  aiSymptomAPI.get(`/history/${analysisId}`);

export const deleteSymptomHistory = (analysisId) =>
  aiSymptomAPI.delete(`/history/${analysisId}`);

export const escalateSymptomCheck = (analysisId) =>
  aiSymptomAPI.post(`/check/${analysisId}/escalate`);

export const createSymptomNotification = (analysisId) =>
  aiSymptomAPI.post(`/check/${analysisId}/create-notification`);

export const recommendConsultation = (analysisId) =>
  aiSymptomAPI.post(`/check/${analysisId}/recommend-consultation`);

export const getAdminLogs = () =>
  aiSymptomAPI.get('/admin/logs');

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

export const getAdminLogs = () =>
  aiSymptomAPI.get('/admin/logs');

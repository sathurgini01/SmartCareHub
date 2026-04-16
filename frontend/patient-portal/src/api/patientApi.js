import axios from './axios';

const PATIENT_BASE_URL = 'http://localhost:5002/api/patients';

export const getMyProfile = () => axios.get(`${PATIENT_BASE_URL}/me`);
export const updateProfile = (data) => axios.put(`${PATIENT_BASE_URL}/me`, data);
export const uploadReport = (formData) => axios.post(`${PATIENT_BASE_URL}/upload-report`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getReports = () => axios.get(`${PATIENT_BASE_URL}/reports`);
export const getPrescriptions = () => axios.get(`${PATIENT_BASE_URL}/prescriptions`);

import api from './api';

export const doctorService = {
  // Get all doctors with optional filters
  getAll: (params = {}) => api.get('/appointments/doctors', { params }),
  
  // Get single doctor
  getById: (id) => api.get(`/appointments/doctors/${id}`),
  
  // Get available time slots for a doctor on a date
  getAvailability: (id, date) => api.get(`/appointments/doctors/${id}/availability`, { params: { date } }),
  
  // Get all specialties with counts
  getSpecialties: () => api.get('/appointments/specialties')
};

export default doctorService;

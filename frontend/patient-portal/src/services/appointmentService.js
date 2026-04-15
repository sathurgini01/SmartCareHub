import api from './api';

export const appointmentService = {
  // Book new appointment
  create: (data) => api.post('/appointments', data),
  
  // Get my appointments
  getMyAppointments: (params = {}) => api.get('/appointments/my-appointments', { params }),
  
  // Get single appointment
  getById: (id) => api.get(`/appointments/${id}`),
  
  // Update appointment (reschedule)
  update: (id, data) => api.put(`/appointments/${id}`, data),
  
  // Cancel appointment
  cancel: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  
  // Update appointment status (doctor/admin)
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  
  // Admin: Get all appointments
  adminGetAll: (params = {}) => api.get('/appointments/admin/all', { params }),
  
  // Admin: Force cancel
  adminCancel: (id, reason) => api.put(`/appointments/admin/${id}/cancel`, { reason })
};

export default appointmentService;

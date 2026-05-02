import api from './api';

export const paymentService = {
  // Create payment
  create: (data) => api.post('/payments', data),
  
  // Secure mock checkout (University Project Requirement)
  checkout: (data) => api.post('/payments/checkout', data),
  
  // Get status (University Project Requirement)
  getStatus: (id) => api.get(`/payments/status/${id}`),

  // Get payment by ID
  getById: (id) => api.get(`/payments/${id}`),
  
  // Get payment by appointment ID
  getByAppointment: (appointmentId) => api.get(`/payments/appointment/${appointmentId}`),
  
  // Get my payments
  getMyPayments: (params = {}) => api.get('/payments/my-payments', { params }),
  
  // Simulate payment (for testing)
  simulate: (id) => api.put(`/payments/${id}/simulate`),
  
  // Cancel payment
  cancel: (id) => api.put(`/payments/${id}/cancel`),
  
  // Admin: Get all payments
  adminGetAll: (params = {}) => api.get('/payments/admin/all', { params }),
  
  // Admin: Get transaction logs
  adminGetTransactions: (params = {}) => api.get('/payments/admin/transactions', { params }),
  
  // Admin: Refund payment
  adminRefund: (id, reason) => api.put(`/payments/${id}/refund`, { reason })
};

export default paymentService;

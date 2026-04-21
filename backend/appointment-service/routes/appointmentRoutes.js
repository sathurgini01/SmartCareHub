const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { validateAppointmentCreate, validateAppointmentUpdate } = require('../middleware/validation');
const {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getSpecialties,
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  updatePaymentStatus,
  getAllAppointments,
  adminCancelAppointment
} = require('../controllers/appointmentController');

// ============== Public Routes ==============
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);
router.get('/doctors/:id/availability', getDoctorAvailability);
router.get('/specialties', getSpecialties);

// ============== Patient Routes ==============
router.post('/', auth, validateAppointmentCreate, createAppointment);
router.get('/my-appointments', auth, getMyAppointments);
router.get('/doctor/:id', auth, authorize('doctor', 'admin'), getDoctorAppointments);
router.get('/:id', auth, getAppointmentById);
router.put('/:id', auth, validateAppointmentUpdate, updateAppointment);
router.put('/:id/cancel', auth, cancelAppointment);

// ============== Doctor/Admin Routes ==============
router.put('/:id/status', auth, authorize('doctor', 'admin'), updateAppointmentStatus);

// ============== Internal Service Route ==============
// Used by Payment Service to update payment status
router.put('/:id/payment-status', updatePaymentStatus);

// ============== Admin Routes ==============
router.get('/admin/all', auth, authorize('admin'), getAllAppointments);
router.put('/admin/:id/cancel', auth, authorize('admin'), adminCancelAppointment);

module.exports = router;

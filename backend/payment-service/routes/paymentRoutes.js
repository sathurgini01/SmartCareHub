const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { validatePaymentCreate, validateRefund } = require('../middleware/validation');
const {
  createPayment,
  payhereNotify,
  simulatePayment,
  getPaymentById,
  getPaymentByAppointment,
  getMyPayments,
  refundPayment,
  cancelPayment,
  getAllPayments,
  getTransactionLogs
} = require('../controllers/paymentController');

// ============== PayHere Webhook (no auth - called by PayHere servers) ==============
router.post('/notify', payhereNotify);

// ============== Patient Routes ==============
router.post('/', auth, validatePaymentCreate, createPayment);
router.get('/my-payments', auth, getMyPayments);
router.get('/appointment/:appointmentId', auth, getPaymentByAppointment);
router.get('/:id', auth, getPaymentById);
router.put('/:id/cancel', auth, cancelPayment);

// ============== Simulate Payment (for testing) ==============
router.put('/:id/simulate', auth, simulatePayment);

// ============== Admin Routes ==============
router.get('/admin/all', auth, authorize('admin'), getAllPayments);
router.get('/admin/transactions', auth, authorize('admin'), getTransactionLogs);
router.put('/:id/refund', auth, authorize('admin'), validateRefund, refundPayment);

module.exports = router;

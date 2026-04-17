const Payment = require('../models/Payment');
const TransactionLog = require('../models/TransactionLog');
const axios = require('axios');
const CryptoJS = require('crypto-js');

const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5003';
const PAYMENT_PORT = process.env.PORT || '5002';

// Helper: Create a transaction log entry
const createTransactionLog = async (payment, action, previousStatus, performedBy, metadata = {}) => {
  try {
    await TransactionLog.create({
      paymentId: payment._id,
      transactionRef: payment.transactionRef,
      action,
      previousStatus,
      newStatus: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      performedBy: performedBy || { userId: 'system', role: 'system', name: 'System' },
      metadata
    });
  } catch (error) {
    console.error('Transaction log error:', error.message);
  }
};

// Helper: Update appointment payment status via inter-service call
const updateAppointmentPaymentStatus = async (appointmentId, paymentId, paymentStatus) => {
  try {
    await axios.put(
      `${APPOINTMENT_SERVICE_URL}/api/appointments/${appointmentId}/payment-status`,
      { paymentId, paymentStatus }
    );
  } catch (error) {
    console.error('Failed to update appointment payment status:', error.message);
  }
};

// Helper: Generate PayHere hash
const generatePayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  const hashedSecret = CryptoJS.MD5(merchantSecret).toString().toUpperCase();
  const amountFormatted = parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '');
  const hashStr = merchantId + orderId + amountFormatted + currency + hashedSecret;
  return CryptoJS.MD5(hashStr).toString().toUpperCase();
};

// ============================================================
// PAYMENT CRUD ENDPOINTS
// ============================================================

// @desc    Create payment for appointment & get PayHere checkout data
// @route   POST /api/payments
// @access  Patient (authenticated)
const createPayment = async (req, res) => {
  try {
    const { 
      appointmentId, amount, currency = 'LKR', method = 'payhere',
      patientName, patientEmail, patientPhone, doctorName, specialty
    } = req.body;

    // Check if payment already exists for this appointment
    const existingPayment = await Payment.findOne({ 
      appointmentId, 
      status: { $nin: ['cancelled', 'failed'] } 
    });

    if (existingPayment) {
      return res.status(409).json({ 
        success: false, 
        message: 'Payment already exists for this appointment',
        data: existingPayment
      });
    }

    const payment = new Payment({
      appointmentId,
      patientId: req.user ? req.user.userId : 'guest',
      patientName,
      patientEmail,
      patientPhone: patientPhone || '',
      doctorName: doctorName || '',
      specialty: specialty || '',
      amount,
      currency,
      method,
      status: 'pending'
    });

    await payment.save();

    // Log the creation
    await createTransactionLog(payment, 'created', null, 
      req.user ? { userId: req.user.userId, role: req.user.role, name: req.user.name } : undefined
    );

    // Generate PayHere hash for checkout
    let payhereData = null;
    if (method === 'payhere') {
      const merchantId = process.env.PAYHERE_MERCHANT_ID;
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
      const orderId = payment.transactionRef;

      const hash = generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret);

      payhereData = {
        sandbox: process.env.PAYHERE_SANDBOX === 'true',
        merchant_id: merchantId,
        return_url: `http://localhost:3000/payment/confirm/${payment._id}`,
        cancel_url: `http://localhost:3000/payment/cancel/${payment._id}`,
        notify_url: `http://localhost:${PAYMENT_PORT}/api/payments/notify`,
        order_id: orderId,
        items: `Medical Consultation - ${doctorName || 'Doctor'}`,
        currency,
        amount: parseFloat(amount).toFixed(2),
        first_name: patientName ? patientName.split(' ')[0] : 'Patient',
        last_name: (patientName && patientName.split(' ').slice(1).join(' ')) ? patientName.split(' ').slice(1).join(' ') : 'Doe',
        email: patientEmail || 'no-email@example.com',
        phone: patientPhone || '0770000000',
        address: 'N/A',
        city: 'Colombo',
        country: 'Sri Lanka',
        hash
      };
    }

    res.status(201).json({ 
      success: true, 
      message: 'Payment created successfully',
      data: payment,
      payhereData
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Server error creating payment' });
  }
};

// @desc    PayHere notification webhook (called by PayHere servers)
// @route   POST /api/payments/notify
// @access  Public (PayHere servers)
const payhereNotify = async (req, res) => {
  try {
    const {
      merchant_id, order_id, payhere_amount, payhere_currency,
      status_code, md5sig, payment_id: payhere_payment_id
    } = req.body;

    console.log('PayHere notification received:', { order_id, status_code });

    // Verify the hash
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const hashedSecret = CryptoJS.MD5(merchantSecret).toString().toUpperCase();
    const localMd5 = CryptoJS.MD5(
      merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret
    ).toString().toUpperCase();

    if (localMd5 !== md5sig) {
      console.error('PayHere hash verification failed!');
      return res.status(400).json({ success: false, message: 'Hash verification failed' });
    }

    // Find payment by transaction reference
    const payment = await Payment.findOne({ transactionRef: order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const previousStatus = payment.status;
    payment.payherePaymentId = payhere_payment_id;

    // Status codes: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = charged back
    switch (parseInt(status_code)) {
      case 2:
        payment.status = 'completed';
        payment.paidAt = new Date();
        // Update appointment payment status
        await updateAppointmentPaymentStatus(payment.appointmentId, payment._id.toString(), 'paid');
        break;
      case 0:
        payment.status = 'processing';
        break;
      case -1:
        payment.status = 'cancelled';
        break;
      case -2:
        payment.status = 'failed';
        break;
      case -3:
        payment.status = 'refunded';
        payment.refundedAt = new Date();
        await updateAppointmentPaymentStatus(payment.appointmentId, payment._id.toString(), 'refunded');
        break;
      default:
        payment.status = 'failed';
    }

    await payment.save();

    await createTransactionLog(payment, payment.status, previousStatus, 
      { userId: 'payhere', role: 'system', name: 'PayHere Gateway' },
      { status_code, payhere_payment_id }
    );

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayHere notify error:', error);
    res.status(500).json({ success: false, message: 'Notification processing error' });
  }
};

// @desc    Simulate payment completion (for testing without PayHere)
// @route   PUT /api/payments/:id/simulate
// @access  Authenticated
const simulatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'pending' && payment.status !== 'processing') {
      return res.status(400).json({ success: false, message: `Cannot process ${payment.status} payment` });
    }

    const previousStatus = payment.status;
    payment.status = 'completed';
    payment.paidAt = new Date();
    payment.method = 'payhere';
    await payment.save();

    // Update appointment
    await updateAppointmentPaymentStatus(payment.appointmentId, payment._id.toString(), 'paid');

    await createTransactionLog(payment, 'completed', previousStatus,
      req.user ? { userId: req.user.userId, role: req.user.role, name: req.user.name } : undefined,
      { simulated: true }
    );

    res.json({ 
      success: true, 
      message: 'Payment completed successfully (simulated)',
      data: payment 
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Patient/Admin
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Patients can only see their own payments
    if (req.user.role === 'patient' && payment.patientId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get payment by appointment ID
// @route   GET /api/payments/appointment/:appointmentId
// @access  Authenticated
const getPaymentByAppointment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ 
      appointmentId: req.params.appointmentId,
      status: { $nin: ['cancelled'] }
    }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'No payment found for this appointment' });
    }

    let payhereData = null;
    if (payment.method === 'payhere') {
      const merchantId = process.env.PAYHERE_MERCHANT_ID;
      const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
      const orderId = payment.transactionRef;
      const hash = generatePayHereHash(merchantId, orderId, payment.amount, payment.currency, merchantSecret);

      payhereData = {
        sandbox: process.env.PAYHERE_SANDBOX === 'true',
        merchant_id: merchantId,
        return_url: `http://localhost:3000/payment/confirm/${payment._id}`,
        cancel_url: `http://localhost:3000/payment/cancel/${payment._id}`,
        notify_url: `http://localhost:${PAYMENT_PORT}/api/payments/notify`,
        order_id: orderId,
        items: `Medical Consultation - ${payment.doctorName || 'Doctor'}`,
        currency: payment.currency,
        amount: parseFloat(payment.amount).toFixed(2),
        first_name: payment.patientName ? payment.patientName.split(' ')[0] : 'Patient',
        last_name: (payment.patientName && payment.patientName.split(' ').slice(1).join(' ')) ? payment.patientName.split(' ').slice(1).join(' ') : 'Doe',
        email: payment.patientEmail || 'no-email@example.com',
        phone: payment.patientPhone || '0770000000',
        address: 'N/A',
        city: 'Colombo',
        country: 'Sri Lanka',
        hash
      };
    }

    res.json({ success: true, data: payment, payhereData });
  } catch (error) {
    console.error('Get payment by appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get my payment history
// @route   GET /api/payments/my-payments
// @access  Patient
const getMyPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { patientId: req.user.userId };
    if (status) query.status = status;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Process refund
// @route   PUT /api/payments/:id/refund
// @access  Admin
const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });
    }

    const previousStatus = payment.status;
    payment.status = 'refunded';
    payment.refundReason = req.body.reason;
    payment.refundedBy = req.user.userId;
    payment.refundedAt = new Date();
    await payment.save();

    // Update appointment
    await updateAppointmentPaymentStatus(payment.appointmentId, payment._id.toString(), 'refunded');

    await createTransactionLog(payment, 'refunded', previousStatus,
      { userId: req.user.userId, role: req.user.role, name: req.user.name },
      { reason: req.body.reason }
    );

    res.json({ 
      success: true, 
      message: 'Payment refunded successfully',
      data: payment 
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel payment
// @route   PUT /api/payments/:id/cancel
// @access  Patient/Admin
const cancelPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (!['pending', 'processing'].includes(payment.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel ${payment.status} payment` });
    }

    const previousStatus = payment.status;
    payment.status = 'cancelled';
    await payment.save();

    await createTransactionLog(payment, 'cancelled', previousStatus,
      req.user ? { userId: req.user.userId, role: req.user.role, name: req.user.name } : undefined
    );

    res.json({ 
      success: true, 
      message: 'Payment cancelled successfully',
      data: payment 
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

// @desc    Get all payments (admin)
// @route   GET /api/payments/admin/all
// @access  Admin
const getAllPayments = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Stats
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: payments,
      stats: {
        byStatus: stats.reduce((acc, s) => ({ ...acc, [s._id]: { count: s.count, amount: s.totalAmount } }), {}),
        totalRevenue: totalRevenue[0]?.total || 0
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin get all payments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get transaction logs (admin)
// @route   GET /api/payments/admin/transactions
// @access  Admin
const getTransactionLogs = async (req, res) => {
  try {
    const { paymentId, action, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (paymentId) query.paymentId = paymentId;
    if (action) query.action = action;

    const total = await TransactionLog.countDocuments(query);
    const logs = await TransactionLog.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get transaction logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
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
};

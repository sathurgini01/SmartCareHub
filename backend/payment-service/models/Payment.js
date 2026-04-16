const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Reference to appointment
  appointmentId: {
    type: String,
    required: [true, 'Appointment ID is required'],
    index: true
  },

  // Patient info (denormalized)
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    index: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    default: ''
  },

  // Doctor info (denormalized)
  doctorName: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    default: ''
  },

  // Payment details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  method: {
    type: String,
    enum: ['card', 'bank_transfer', 'payhere', 'insurance', 'cash'],
    default: 'payhere'
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },

  // Transaction references
  transactionRef: {
    type: String,
    unique: true
  },
  payhereOrderId: {
    type: String,
    default: null
  },
  payherePaymentId: {
    type: String,
    default: null
  },

  // Refund info
  refundReason: {
    type: String,
    default: ''
  },
  refundedBy: {
    type: String,
    default: null
  },

  // Timestamps
  paidAt: {
    type: Date,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate unique transaction reference
paymentSchema.pre('save', function() {
  if (!this.transactionRef) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionRef = `TXN-${dateStr}-${random}`;
  }
});

module.exports = mongoose.model('Payment', paymentSchema);

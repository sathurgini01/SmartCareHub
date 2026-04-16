const mongoose = require('mongoose');

// Immutable audit log for every payment state change
const transactionLogSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  transactionRef: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'processing', 'completed', 'failed', 'refunded', 'cancelled', 'status_update']
  },
  previousStatus: {
    type: String,
    default: null
  },
  newStatus: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  performedBy: {
    userId: { type: String, default: 'system' },
    role: { type: String, default: 'system' },
    name: { type: String, default: 'System' }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Make logs immutable-ish (no updates allowed)
transactionLogSchema.pre('findOneAndUpdate', function() {
  throw new Error('Transaction logs are immutable and cannot be updated');
});

module.exports = mongoose.model('TransactionLog', transactionLogSchema);

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Patient info - denormalized for service independence
  // Integration: patientId will map to Member 1's Patient Service _id
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    index: true
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientEmail: {
    type: String,
    required: [true, 'Patient email is required'],
    lowercase: true
  },
  patientPhone: {
    type: String,
    default: ''
  },

  // Doctor info - denormalized
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required']
  },
  specialty: {
    type: String,
    required: true
  },

  // Appointment details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    index: true
  },
  timeSlot: {
    start: { type: String, required: true }, // "09:00"
    end: { type: String, required: true }    // "09:30"
  },
  
  reason: {
    type: String,
    required: [true, 'Reason for visit is required'],
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    default: '',
    maxlength: 1000
  },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
    index: true
  },

  // Payment tracking
  paymentId: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  consultationFee: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'LKR'
  },

  // Cancellation
  cancellationReason: {
    type: String,
    default: ''
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin', null],
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },

  // Metadata
  appointmentNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate unique appointment number before saving
appointmentSchema.pre('save', async function() {
  if (!this.appointmentNumber) {
    const count = await mongoose.model('Appointment').countDocuments();
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    this.appointmentNumber = `APT-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
});

// Compound index to prevent double booking
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, 'timeSlot.start': 1 },
  { unique: true, partialFilterExpression: { status: { $nin: ['cancelled'] } } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

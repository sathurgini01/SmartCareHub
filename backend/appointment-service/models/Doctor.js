const mongoose = require('mongoose');

// Mock Doctor model for standalone mode.
// When integrating with Member 2 (Doctor Service), replace this with 
// API calls to the Doctor Service via: GET http://DOCTOR_SERVICE_URL/api/doctors
// The schema is designed to match expected Doctor Service response format.

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "17:00"
  slotDuration: { type: Number, default: 30 }  // minutes per slot
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  // Integration field: this will map to the actual Doctor Service's _id
  externalDoctorId: {
    type: String,
    default: null,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    enum: [
      'General Medicine',
      'Cardiology',
      'Dermatology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Gynecology',
      'Ophthalmology',
      'ENT',
      'Psychiatry',
      'Dental'
    ]
  },
  qualifications: {
    type: [String],
    default: []
  },
  experience: {
    type: Number,
    default: 0 // years
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'LKR'
  },
  avatar: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  availability: {
    type: [availabilitySlotSchema],
    default: []
  },
  hospital: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Integration: source of this doctor record
  source: {
    type: String,
    enum: ['local', 'doctor-service'],
    default: 'local'
  }
}, {
  timestamps: true
});

// Index for searching
doctorSchema.index({ specialty: 1, isAvailable: 1 });
doctorSchema.index({ name: 'text', specialty: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);

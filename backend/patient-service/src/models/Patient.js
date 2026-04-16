const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    type: String
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  reports: [
    {
      fileName: String,
      filePath: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  isSuspended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
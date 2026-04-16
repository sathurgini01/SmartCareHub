const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    patientId: {
      type: String,
      required: true,
      trim: true
    },
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    appointmentDate: {
      type: String,
      required: true,
      trim: true
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    reason: {
      type: String,
      trim: true,
      default: ''
    },
    consultationType: {
      type: String,
      enum: ['Online', 'Physical', 'Both'],
      default: 'Online'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'rescheduled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

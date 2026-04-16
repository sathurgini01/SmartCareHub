const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      trim: true,
      default: 'Online'
    },
    consultationType: {
      type: String,
      enum: ['Online', 'Physical', 'Both'],
      default: 'Online'
    },
    status: {
      type: String,
      trim: true,
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

availabilitySchema.index({ doctorId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);

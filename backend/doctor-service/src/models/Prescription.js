const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
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
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    medicines: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          dosage: { type: String, default: '', trim: true },
          frequency: { type: String, default: '', trim: true },
          duration: { type: String, default: '', trim: true },
          instructions: { type: String, default: '', trim: true }
        }
      ],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one medicine is required'
      }
    },
    diagnosis: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    followUpDate: {
      type: Date,
      default: null
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);

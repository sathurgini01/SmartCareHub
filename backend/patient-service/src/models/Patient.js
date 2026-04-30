const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  description: { type: String, default: '' },
  patientUserId: { type: String, default: '' },
  patientName: { type: String, default: '' },
  doctorId: { type: String, default: '' },
  doctorName: { type: String, default: '' },
  doctorEmail: { type: String, default: '' },
  fileType: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
});

const prescriptionSchema = new mongoose.Schema({
  doctorName: { type: String, default: '' },
  medication: { type: String, required: true },
  dosage: { type: String, default: '' },
  instructions: { type: String, default: '' },
  issuedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
});

const patientSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
    address: { type: String, default: '' },
    medicalHistory: { type: String, default: '' },
    reports: [reportSchema],
    prescriptions: [prescriptionSchema],
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);

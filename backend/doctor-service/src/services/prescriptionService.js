const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../validators/commonValidators');

async function createPrescription(payload, requester) {
  const { patientId, patientName, doctorId, medicines, notes, date, diagnosis, followUpDate } = payload;

  if (requester.role !== 'doctor' && requester.role !== 'admin') {
    throw new ApiError(403, 'Only doctors or admins can create prescriptions');
  }

  if (!patientId || !patientName || !doctorId || !medicines) {
    throw new ApiError(400, 'patientId, patientName, doctorId and medicines are required');
  }

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, 'Invalid doctorId');
  }

  if (requester.role === 'doctor' && requester.id !== doctorId) {
    throw new ApiError(403, 'You can only create prescriptions for yourself');
  }

  if (!Array.isArray(medicines) || medicines.length === 0) {
    throw new ApiError(400, 'Medicines must be a non-empty array');
  }

  return Prescription.create({
    patientId,
    patientName,
    doctorId,
    medicines,
    notes,
    date,
    diagnosis,
    followUpDate
  });
}

async function updatePrescription(id, payload, requester) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid prescription id');
  }

  const prescription = await Prescription.findById(id);
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  if (requester.role !== 'admin' && requester.id !== String(prescription.doctorId)) {
    throw new ApiError(403, 'You can only update your own prescriptions');
  }

  ['patientId', 'patientName', 'notes', 'date', 'diagnosis', 'followUpDate'].forEach((field) => {
    if (payload[field] !== undefined) {
      prescription[field] = payload[field];
    }
  });

  if (payload.medicines !== undefined) {
    if (!Array.isArray(payload.medicines) || payload.medicines.length === 0) {
      throw new ApiError(400, 'Medicines must be a non-empty array');
    }
    prescription.medicines = payload.medicines;
  }

  await prescription.save();
  return prescription;
}

async function deletePrescription(id, requester) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid prescription id');
  }

  const prescription = await Prescription.findById(id);
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  if (requester.role !== 'admin' && requester.id !== String(prescription.doctorId)) {
    throw new ApiError(403, 'You can only delete your own prescriptions');
  }

  await prescription.deleteOne();
}

async function getPrescriptionHistory(doctorId, requester) {
  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, 'Invalid doctorId');
  }

  if (requester.role !== 'admin' && requester.id !== doctorId) {
    throw new ApiError(403, 'You can only view your own prescription history');
  }

  return Prescription.find({ doctorId }).sort({ date: -1 });
}

async function getPatientPrescriptionHistory(requester) {
  if (!requester || requester.role !== 'patient') {
    throw new ApiError(403, 'Only patients can view patient prescription history');
  }

  const prescriptions = await Prescription.find({ patientId: String(requester.id) }).sort({ date: -1 });
  const doctorIds = [...new Set(prescriptions.map((item) => String(item.doctorId)))];
  const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select('name');
  const doctorNameById = new Map(doctors.map((doctor) => [String(doctor._id), doctor.name]));

  return prescriptions.map((prescription) => {
    const item = prescription.toObject();
    item.doctorName = doctorNameById.get(String(item.doctorId)) || 'Doctor';
    return item;
  });
}

async function getPrescriptionsByPatientId(patientId, requester) {
  if (requester.role !== 'admin' && requester.role !== 'doctor') {
    throw new ApiError(403, 'Only admins or doctors can view prescriptions for other patients');
  }

  const prescriptions = await Prescription.find({ patientId }).sort({ date: -1 });
  const doctorIds = [...new Set(prescriptions.map((item) => String(item.doctorId)))];
  const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select('name');
  const doctorNameById = new Map(doctors.map((doctor) => [String(doctor._id), doctor.name]));

  return prescriptions.map((prescription) => {
    const item = prescription.toObject();
    item.doctorName = doctorNameById.get(String(item.doctorId)) || 'Doctor';
    return item;
  });
}

module.exports = {
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionHistory,
  getPatientPrescriptionHistory,
  getPrescriptionsByPatientId
};

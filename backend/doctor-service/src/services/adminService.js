const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../validators/commonValidators');

async function updateDoctorStatus(id, status) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid doctor id');
  }

  const doctor = await Doctor.findById(id).select('-password');

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  doctor.status = status;
  await doctor.save();

  return doctor;
}

async function getAllDoctors() {
  return Doctor.find().select('-password').sort({ createdAt: -1 });
}

module.exports = {
  updateDoctorStatus,
  getAllDoctors
};
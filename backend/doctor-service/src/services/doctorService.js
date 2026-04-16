const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const {
  isValidObjectId,
  isValidEmail,
  isValidLicenseNumber,
  isStrongPassword
} = require('../validators/commonValidators');

async function getDoctorById(id, requester = null) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid doctor id');
  }

  if (
    requester &&
    requester.role !== 'admin' &&
    requester.id !== id
  ) {
    throw new ApiError(403, 'You can only access your own profile');
  }

  const doctor = await Doctor.findById(id).select('-password');
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  return doctor;
}

async function updateDoctor(id, payload, requester) {
  if (
    requester &&
    requester.role !== 'admin' &&
    requester.id !== id
  ) {
    throw new ApiError(403, 'You can only update your own profile');
  }

  const doctor = await Doctor.findById(id).select('+password');
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const allowedFields = [
    'name',
    'email',
    'password',
    'specialization',
    'licenseNumber',
    'experience',
    'hospital',
    'phone',
    'bio',
    'profileImage',
    'title',
    'accessKey'
  ];

  if (payload.fullName !== undefined) {
    payload.name = payload.fullName;
  }

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      doctor[field] = payload[field];
    }
  }

  if (payload.email && !isValidEmail(payload.email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  if (payload.password && !isStrongPassword(payload.password)) {
    throw new ApiError(
      400,
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
    );
  }

  if (payload.licenseNumber && !isValidLicenseNumber(payload.licenseNumber)) {
    throw new ApiError(400, 'Invalid license number format');
  }

  if (payload.email) {
    const existingEmail = await Doctor.findOne({
      email: payload.email.toLowerCase(),
      _id: { $ne: doctor._id }
    });
    if (existingEmail) {
      throw new ApiError(409, 'Email already in use');
    }
    doctor.email = payload.email.toLowerCase();
  }

  if (payload.licenseNumber) {
    const normalizedLicense = payload.licenseNumber.toUpperCase();
    const existingLicense = await Doctor.findOne({
      licenseNumber: normalizedLicense,
      _id: { $ne: doctor._id }
    });
    if (existingLicense) {
      throw new ApiError(409, 'License number already in use');
    }
    doctor.licenseNumber = normalizedLicense;
  }

  await doctor.save();

  const safeDoctor = doctor.toObject();
  delete safeDoctor.password;

  return safeDoctor;
}

async function deleteDoctor(id, requester) {
  if (
    requester &&
    requester.role !== 'admin' &&
    requester.id !== id
  ) {
    throw new ApiError(403, 'You can only delete your own account');
  }

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid doctor id');
  }

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  await doctor.deleteOne();
}

module.exports = {
  getDoctorById,
  updateDoctor,
  deleteDoctor
};

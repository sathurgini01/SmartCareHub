const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const {
  isValidEmail,
  isStrongPassword,
  isValidLicenseNumber
} = require('../validators/commonValidators');

function signToken(doctor) {
  return jwt.sign(
    {
      id: doctor._id,
      email: doctor.email,
      role: doctor.role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function registerDoctor(payload) {
  const {
    name,
    email,
    password,
    specialization,
    licenseNumber,
    experience
  } = payload;

  if (!name || !email || !password || !specialization || !licenseNumber || experience === undefined) {
    throw new ApiError(400, 'All registration fields are required');
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  if (!isStrongPassword(password)) {
    throw new ApiError(
      400,
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
    );
  }

  if (!isValidLicenseNumber(licenseNumber)) {
    throw new ApiError(400, 'Invalid license number format');
  }

  const existingEmail = await Doctor.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(409, 'Doctor already exists with this email');
  }

  const existingLicense = await Doctor.findOne({ licenseNumber: licenseNumber.toUpperCase() });
  if (existingLicense) {
    throw new ApiError(409, 'Doctor already exists with this license number');
  }

  const doctor = await Doctor.create({
    name,
    email: email.toLowerCase(),
    password,
    specialization,
    licenseNumber: licenseNumber.toUpperCase(),
    experience,
    status: 'pending',
    role: 'doctor'
  });

  const safeDoctor = doctor.toObject();
  delete safeDoctor.password;

  return safeDoctor;
}

async function loginDoctor(payload) {
  const { email, password } = payload;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const doctor = await Doctor.findOne({ email: email.toLowerCase() }).select('+password');

  if (!doctor) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await doctor.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken(doctor);

  const safeDoctor = doctor.toObject();
  delete safeDoctor.password;

  return { token, doctor: safeDoctor };
}

module.exports = {
  registerDoctor,
  loginDoctor
};
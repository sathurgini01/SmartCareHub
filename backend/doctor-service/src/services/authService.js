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

function normalizeUser(doctor) {
  const safeDoctor = doctor.toObject ? doctor.toObject() : { ...doctor };
  delete safeDoctor.password;
  return safeDoctor;
}

async function registerDoctor(payload) {
  const {
    name,
    fullName,
    email,
    password,
    specialization,
    licenseNumber,
    experience,
    hospital,
    phone,
    bio,
    profileImage
  } = payload;
  const normalizedName = fullName || name;

  if (!normalizedName || !email || !password || !specialization || !licenseNumber || experience === undefined) {
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
    name: normalizedName,
    email: email.toLowerCase(),
    password,
    specialization,
    licenseNumber: licenseNumber.toUpperCase(),
    experience,
    hospital: hospital || '',
    phone: phone || '',
    bio: bio || '',
    profileImage: profileImage || '',
    status: 'approved',
    role: 'doctor'
  });

  return normalizeUser(doctor);
}

async function registerAdmin(payload) {
  const { name, fullName, email, password, accessKey, title } = payload;
  const normalizedName = fullName || name;

  if (!normalizedName || !email || !password || !accessKey) {
    throw new ApiError(400, 'All admin registration fields are required');
  }

  if (accessKey !== 'SMARTCARE-ADMIN') {
    throw new ApiError(403, 'Admin access key is invalid');
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

  const existingEmail = await Doctor.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(409, 'Account already exists with this email');
  }

  const admin = await Doctor.create({
    name: normalizedName,
    email: email.toLowerCase(),
    password,
    role: 'admin',
    status: 'approved',
    title: title || 'Operations Admin',
    accessKey
  });

  return normalizeUser(admin);
}

async function loginUser(payload, expectedRole = null) {
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

  if (expectedRole && doctor.role !== expectedRole) {
    throw new ApiError(403, `This account is not registered as ${expectedRole}`);
  }

  const token = signToken(doctor);
  return { token, doctor: normalizeUser(doctor) };
}

module.exports = {
  registerDoctor,
  registerAdmin,
  loginUser
};

const mongoose = require('mongoose');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
}

function isValidLicenseNumber(licenseNumber) {
  return /^[A-Z0-9-]{6,20}$/.test(licenseNumber);
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isValidTimeRange(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return !Number.isNaN(start.valueOf()) && !Number.isNaN(end.valueOf()) && start < end;
}

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidLicenseNumber,
  isValidObjectId,
  isValidTimeRange
};

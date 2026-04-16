const adminService = require('../services/adminService');
const { sendSuccess } = require('../utils/response');

async function approveDoctor(req, res, next) {
  try {
    const doctor = await adminService.updateDoctorStatus(req.params.id, 'approved');
    return sendSuccess(res, 200, 'Doctor approved successfully', doctor);
  } catch (error) {
    return next(error);
  }
}

async function rejectDoctor(req, res, next) {
  try {
    const doctor = await adminService.updateDoctorStatus(req.params.id, 'rejected');
    return sendSuccess(res, 200, 'Doctor rejected successfully', doctor);
  } catch (error) {
    return next(error);
  }
}

async function getAllDoctors(req, res, next) {
  try {
    const doctors = await adminService.getAllDoctors();
    return sendSuccess(res, 200, 'Doctors fetched', doctors);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  approveDoctor,
  rejectDoctor,
  getAllDoctors
};
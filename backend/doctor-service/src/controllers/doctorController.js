const doctorService = require('../services/doctorService');
const { sendSuccess } = require('../utils/response');

async function getDoctorProfile(req, res, next) {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Doctor profile fetched', doctor);
  } catch (error) {
    return next(error);
  }
}

async function getMyDoctorProfile(req, res, next) {
  try {
    const doctor = await doctorService.getDoctorByRequester(req.user);
    return sendSuccess(res, 200, 'Doctor profile fetched', doctor);
  } catch (error) {
    return next(error);
  }
}

async function updateDoctorProfile(req, res, next) {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, 'Doctor profile updated', doctor);
  } catch (error) {
    return next(error);
  }
}

async function deleteDoctorAccount(req, res, next) {
  try {
    await doctorService.deleteDoctor(req.params.id, req.user);
    return sendSuccess(res, 200, 'Doctor account deleted');
  } catch (error) {
    return next(error);
  }
}

async function listPublicDoctors(req, res, next) {
  try {
    const doctors = await doctorService.listPublicDoctors();
    return sendSuccess(res, 200, 'Doctor directory fetched', doctors);
  } catch (error) {
    return next(error);
  }
}

async function getPublicDoctorProfile(req, res, next) {
  try {
    const doctor = await doctorService.getPublicDoctorById(req.params.id);
    return sendSuccess(res, 200, 'Doctor profile fetched', doctor);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listPublicDoctors,
  getPublicDoctorProfile,
  getMyDoctorProfile,
  getDoctorProfile,
  updateDoctorProfile,
  deleteDoctorAccount
};

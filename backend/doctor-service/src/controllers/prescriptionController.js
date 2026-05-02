const prescriptionService = require('../services/prescriptionService');
const { sendSuccess } = require('../utils/response');

async function createPrescription(req, res, next) {
  try {
    const prescription = await prescriptionService.createPrescription(req.body, req.user);
    return sendSuccess(res, 201, 'Prescription created', prescription);
  } catch (error) {
    return next(error);
  }
}

async function updatePrescription(req, res, next) {
  try {
    const prescription = await prescriptionService.updatePrescription(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, 'Prescription updated', prescription);
  } catch (error) {
    return next(error);
  }
}

async function deletePrescription(req, res, next) {
  try {
    await prescriptionService.deletePrescription(req.params.id, req.user);
    return sendSuccess(res, 200, 'Prescription deleted');
  } catch (error) {
    return next(error);
  }
}

async function viewPrescriptionHistory(req, res, next) {
  try {
    const history = await prescriptionService.getPrescriptionHistory(req.params.doctorId, req.user);
    return sendSuccess(res, 200, 'Prescription history fetched', history);
  } catch (error) {
    return next(error);
  }
}

async function viewMyPrescriptions(req, res, next) {
  try {
    const history = await prescriptionService.getPatientPrescriptionHistory(req.user);
    return sendSuccess(res, 200, 'Patient prescription history fetched', history);
  } catch (error) {
    return next(error);
  }
}

async function viewPatientPrescriptions(req, res, next) {
  try {
    const history = await prescriptionService.getPrescriptionsByPatientId(req.params.patientId, req.user);
    return sendSuccess(res, 200, 'Patient prescriptions fetched', history);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPrescription,
  updatePrescription,
  deletePrescription,
  viewPrescriptionHistory,
  viewMyPrescriptions,
  viewPatientPrescriptions
};

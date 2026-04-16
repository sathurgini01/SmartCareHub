const availabilityService = require('../services/availabilityService');
const { sendSuccess } = require('../utils/response');

async function addAvailability(req, res, next) {
  try {
    const availability = await availabilityService.addAvailability(req.body, req.user);
    return sendSuccess(res, 201, 'Availability slot added', availability);
  } catch (error) {
    return next(error);
  }
}

async function viewAvailability(req, res, next) {
  try {
    const slots = await availabilityService.getAvailabilityByDoctor(req.params.doctorId, req.user);
    return sendSuccess(res, 200, 'Availability fetched', slots);
  } catch (error) {
    return next(error);
  }
}

async function updateAvailability(req, res, next) {
  try {
    const slot = await availabilityService.updateAvailability(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, 'Availability updated', slot);
  } catch (error) {
    return next(error);
  }
}

async function deleteAvailability(req, res, next) {
  try {
    await availabilityService.deleteAvailability(req.params.id, req.user);
    return sendSuccess(res, 200, 'Availability deleted');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  addAvailability,
  viewAvailability,
  updateAvailability,
  deleteAvailability
};
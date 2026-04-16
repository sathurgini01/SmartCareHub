const appointmentService = require('../services/appointmentService');
const { sendSuccess } = require('../utils/response');

async function getAssignedAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.getAssignedAppointments(req.params.id);
    return sendSuccess(res, 200, 'Appointments fetched', appointments);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAssignedAppointments
};
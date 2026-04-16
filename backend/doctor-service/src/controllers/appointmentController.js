const appointmentService = require('../services/appointmentService');
const { sendSuccess } = require('../utils/response');

async function getAssignedAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.getAssignedAppointments(req.params.id, req.user);
    return sendSuccess(res, 200, 'Appointments fetched', appointments);
  } catch (error) {
    return next(error);
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    const appointment = await appointmentService.updateAppointmentStatus(req.params.id, req.body.status, req.user);
    return sendSuccess(res, 200, 'Appointment updated', appointment);
  } catch (error) {
    return next(error);
  }
}

async function rescheduleAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.rescheduleAppointment(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, 'Appointment rescheduled', appointment);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAssignedAppointments,
  updateAppointmentStatus,
  rescheduleAppointment
};

const Appointment = require('../models/Appointment');
const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../validators/commonValidators');

async function getAssignedAppointments(doctorId, requester) {
  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, 'Invalid doctor id');
  }

  if (requester.role !== 'admin' && requester.id !== doctorId) {
    throw new ApiError(403, 'You can only view your own appointments');
  }

  return Appointment.find({ doctorId }).sort({ createdAt: -1 });
}

async function updateAppointmentStatus(id, status, requester) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid appointment id');
  }

  if (!['pending', 'confirmed', 'rejected', 'rescheduled'].includes(status)) {
    throw new ApiError(400, 'Invalid appointment status');
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (requester.role !== 'admin' && requester.id !== String(appointment.doctorId)) {
    throw new ApiError(403, 'You can only update your own appointments');
  }

  appointment.status = status;
  await appointment.save();
  return appointment;
}

async function rescheduleAppointment(id, payload, requester) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid appointment id');
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (requester.role !== 'admin' && requester.id !== String(appointment.doctorId)) {
    throw new ApiError(403, 'You can only update your own appointments');
  }

  if (!payload.appointmentDate || !payload.time) {
    throw new ApiError(400, 'appointmentDate and time are required');
  }

  appointment.appointmentDate = payload.appointmentDate;
  appointment.time = payload.time;
  appointment.status = 'rescheduled';
  await appointment.save();
  return appointment;
}

module.exports = {
  getAssignedAppointments,
  updateAppointmentStatus,
  rescheduleAppointment
};

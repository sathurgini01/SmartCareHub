const Availability = require('../models/Availability');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const { isValidObjectId, isValidTimeRange } = require('../validators/commonValidators');

async function ensureNoOverlap(doctorId, startTime, endTime, excludeId = null) {
  const overlapQuery = {
    doctorId,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };

  if (excludeId) {
    overlapQuery._id = { $ne: excludeId };
  }

  const conflict = await Availability.findOne(overlapQuery);

  if (conflict) {
    throw new ApiError(409, 'Overlapping availability slot detected');
  }
}

async function addAvailability(payload, requester) {
  const { doctorId, startTime, endTime, location } = payload;

  if (!doctorId || !startTime || !endTime) {
    throw new ApiError(400, 'doctorId, startTime and endTime are required');
  }

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, 'Invalid doctorId');
  }

  if (requester.role !== 'admin' && requester.id !== doctorId) {
    throw new ApiError(403, 'You can only manage your own availability');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  if (!isValidTimeRange(startTime, endTime)) {
    throw new ApiError(400, 'Invalid time range. startTime must be before endTime');
  }

  await ensureNoOverlap(doctorId, new Date(startTime), new Date(endTime));

  return Availability.create({
    doctorId,
    startTime,
    endTime,
    location: location || 'Online'
  });
}

async function getAvailabilityByDoctor(doctorId, requester) {
  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, 'Invalid doctorId');
  }

  if (requester.role !== 'admin' && requester.id !== doctorId) {
    throw new ApiError(403, 'You can only view your own availability');
  }

  return Availability.find({ doctorId }).sort({ startTime: 1 });
}

async function updateAvailability(id, payload, requester) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid availability id');
  }

  const availability = await Availability.findById(id);
  if (!availability) {
    throw new ApiError(404, 'Availability slot not found');
  }

  if (requester.role !== 'admin' && requester.id !== String(availability.doctorId)) {
    throw new ApiError(403, 'You can only update your own availability');
  }

  const nextStart = payload.startTime ? new Date(payload.startTime) : availability.startTime;
  const nextEnd = payload.endTime ? new Date(payload.endTime) : availability.endTime;

  if (!isValidTimeRange(nextStart, nextEnd)) {
    throw new ApiError(400, 'Invalid time range. startTime must be before endTime');
  }

  await ensureNoOverlap(availability.doctorId, nextStart, nextEnd, availability._id);

  if (payload.startTime) availability.startTime = payload.startTime;
  if (payload.endTime) availability.endTime = payload.endTime;
  if (payload.location !== undefined) availability.location = payload.location;

  await availability.save();
  return availability;
}

async function deleteAvailability(id, requester) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid availability id');
  }

  const availability = await Availability.findById(id);
  if (!availability) {
    throw new ApiError(404, 'Availability slot not found');
  }

  if (requester.role !== 'admin' && requester.id !== String(availability.doctorId)) {
    throw new ApiError(403, 'You can only delete your own availability');
  }

  await availability.deleteOne();
}

module.exports = {
  addAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability
};
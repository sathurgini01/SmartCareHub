const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../validators/commonValidators');

async function getAssignedAppointments(doctorId) {
  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, 'Invalid doctor id');
  }

  return [
    {
      id: 'APT-1001',
      doctorId,
      patientId: 'PAT-204',
      patientName: 'John Carter',
      scheduledAt: '2026-04-14T09:30:00.000Z',
      status: 'confirmed',
      mode: 'video',
      provider: 'jitsi-ready'
    },
    {
      id: 'APT-1002',
      doctorId,
      patientId: 'PAT-819',
      patientName: 'Alice Wong',
      scheduledAt: '2026-04-14T11:00:00.000Z',
      status: 'pending',
      mode: 'video',
      provider: 'twilio-ready'
    }
  ];
}

module.exports = {
  getAssignedAppointments
};
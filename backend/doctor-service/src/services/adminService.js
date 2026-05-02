const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../validators/commonValidators');

async function updateDoctorStatus(id, status) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid doctor id');
  }

  const doctor = await Doctor.findById(id).select('-password');

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  doctor.status = status;
  await doctor.save();

  // Notify Doctor
  try {
    const { sendNotification } = require('../utils/notificationClient');
    await sendNotification({
      userId: doctor._id,
      recipientEmail: doctor.email,
      recipientPhone: doctor.phone,
      title: status === 'approved' ? 'Account Approved!' : 'Account Status Update',
      subject: status === 'approved' ? 'Your SmartCareHub account is ready' : 'SmartCareHub Application Status',
      message: status === 'approved' 
        ? `Congratulations Dr. ${doctor.name}! Your application has been approved. You can now access all professional features on the platform.`
        : `Your application status has been updated to: ${status}. Please contact support if you have questions.`,
      category: 'system_alert'
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }

  return doctor;
}

async function getAllDoctors() {
  return Doctor.find({ role: 'doctor' }).select('-password').sort({ createdAt: -1 });
}

module.exports = {
  updateDoctorStatus,
  getAllDoctors
};

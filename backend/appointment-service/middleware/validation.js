// Validation middleware for appointment operations

const validateAppointmentCreate = (req, res, next) => {
  const { doctorId, appointmentDate, timeSlot, reason, patientName, patientEmail } = req.body;
  const errors = [];

  if (!doctorId) errors.push('Doctor ID is required');
  if (!appointmentDate) errors.push('Appointment date is required');
  if (!timeSlot || !timeSlot.start || !timeSlot.end) {
    errors.push('Time slot with start and end time is required');
  }
  if (!reason || reason.trim().length < 5) {
    errors.push('Reason for visit is required (minimum 5 characters)');
  }
  if (!patientName || patientName.trim().length < 2) {
    errors.push('Patient name is required');
  }
  if (!patientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
    errors.push('Valid patient email is required');
  }

  // Validate appointment date is not in the past
  const aptDate = new Date(appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (aptDate < today) {
    errors.push('Appointment date cannot be in the past');
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (timeSlot) {
    if (timeSlot.start && !timeRegex.test(timeSlot.start)) {
      errors.push('Start time must be in HH:MM format');
    }
    if (timeSlot.end && !timeRegex.test(timeSlot.end)) {
      errors.push('End time must be in HH:MM format');
    }
    if (timeSlot.start && timeSlot.end && timeSlot.start >= timeSlot.end) {
      errors.push('End time must be after start time');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

const validateAppointmentUpdate = (req, res, next) => {
  const { appointmentDate, timeSlot } = req.body;
  const errors = [];

  if (appointmentDate) {
    const aptDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (aptDate < today) {
      errors.push('Appointment date cannot be in the past');
    }
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (timeSlot) {
    if (timeSlot.start && !timeRegex.test(timeSlot.start)) {
      errors.push('Start time must be in HH:MM format');
    }
    if (timeSlot.end && !timeRegex.test(timeSlot.end)) {
      errors.push('End time must be in HH:MM format');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = { validateAppointmentCreate, validateAppointmentUpdate };

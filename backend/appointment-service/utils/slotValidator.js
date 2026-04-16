const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

/**
 * Slot Validation Utility
 * Handles all appointment time slot validation logic:
 * - Double-booking prevention
 * - Doctor availability validation
 * - Working hours validation
 * - Minimum advance booking time
 */

// Check if the requested slot conflicts with existing appointments
const checkDoubleBooking = async (doctorId, appointmentDate, timeSlot, excludeAppointmentId = null) => {
  const dateStart = new Date(appointmentDate);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(appointmentDate);
  dateEnd.setHours(23, 59, 59, 999);

  const query = {
    doctorId,
    appointmentDate: { $gte: dateStart, $lte: dateEnd },
    status: { $nin: ['cancelled'] },
    'timeSlot.start': timeSlot.start
  };

  // Exclude current appointment when updating
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const existingAppointment = await Appointment.findOne(query);
  
  if (existingAppointment) {
    return {
      isConflict: true,
      message: `Time slot ${timeSlot.start} - ${timeSlot.end} is already booked for this doctor on this date`
    };
  }

  return { isConflict: false };
};

// Validate that the requested time falls within doctor's availability schedule
const validateDoctorAvailability = async (doctorId, appointmentDate, timeSlot) => {
  const doctor = await Doctor.findById(doctorId);
  
  if (!doctor) {
    return { isValid: false, message: 'Doctor not found' };
  }

  if (!doctor.isAvailable) {
    return { isValid: false, message: 'Doctor is currently not available for appointments' };
  }

  // Get day of the week
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(appointmentDate);
  const dayName = dayNames[date.getDay()];

  // Check if doctor works on this day
  const daySchedule = doctor.availability.find(a => a.day === dayName);
  
  if (!daySchedule) {
    return { 
      isValid: false, 
      message: `Doctor is not available on ${dayName}s` 
    };
  }

  // Check if the requested time falls within working hours
  if (timeSlot.start < daySchedule.startTime || timeSlot.end > daySchedule.endTime) {
    return {
      isValid: false,
      message: `Requested time is outside doctor's working hours (${daySchedule.startTime} - ${daySchedule.endTime})`
    };
  }

  return { isValid: true, doctor };
};

// Get available slots for a doctor on a specific date
const getAvailableSlots = async (doctorId, date) => {
  const doctor = await Doctor.findById(doctorId);
  
  if (!doctor || !doctor.isAvailable) {
    return [];
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dateObj = new Date(date);
  const dayName = dayNames[dateObj.getDay()];

  const daySchedule = doctor.availability.find(a => a.day === dayName);
  
  if (!daySchedule) {
    return [];
  }

  // Generate all possible slots
  const slots = [];
  const slotDuration = daySchedule.slotDuration || 30;
  let currentTime = daySchedule.startTime;

  while (currentTime < daySchedule.endTime) {
    const [hours, minutes] = currentTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + slotDuration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    if (endTime <= daySchedule.endTime) {
      slots.push({
        start: currentTime,
        end: endTime,
        available: true
      });
    }

    currentTime = endTime;
  }

  // Mark booked slots
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctorId,
    appointmentDate: { $gte: dateStart, $lte: dateEnd },
    status: { $nin: ['cancelled'] }
  });

  const bookedTimes = bookedAppointments.map(a => a.timeSlot.start);

  slots.forEach(slot => {
    if (bookedTimes.includes(slot.start)) {
      slot.available = false;
    }
  });

  // Filter out past slots if the date is today
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj.getTime() === today.getTime()) {
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    slots.forEach(slot => {
      if (slot.start <= currentTimeStr) {
        slot.available = false;
      }
    });
  }

  return slots;
};

// Validate minimum advance booking time (1 hour before)
const validateAdvanceBooking = (appointmentDate, timeSlot) => {
  const now = new Date();
  const aptDateTime = new Date(appointmentDate);
  const [hours, minutes] = timeSlot.start.split(':').map(Number);
  aptDateTime.setHours(hours, minutes, 0, 0);

  const diffMs = aptDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    return {
      isValid: false,
      message: 'Appointments must be booked at least 1 hour in advance'
    };
  }

  return { isValid: true };
};

module.exports = {
  checkDoubleBooking,
  validateDoctorAvailability,
  getAvailableSlots,
  validateAdvanceBooking
};

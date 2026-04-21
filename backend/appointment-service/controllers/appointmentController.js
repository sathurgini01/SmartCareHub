const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { checkDoubleBooking, validateDoctorAvailability, getAvailableSlots, validateAdvanceBooking } = require('../utils/slotValidator');
const { syncDoctorDirectory } = require('../services/doctorDirectorySync');

async function trySyncDoctorDirectory() {
  try {
    await syncDoctorDirectory();
  } catch (error) {
    console.error('Doctor directory sync warning:', error.message);
  }
}

// ============================================================
// DOCTOR ENDPOINTS (public - for browsing)
// ============================================================

// @desc    Get all doctors with filters
// @route   GET /api/appointments/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    await trySyncDoctorDirectory();
    const { specialty, search, sortBy, order, page = 1, limit = 10 } = req.query;
    
    let query = { isAvailable: true };

    if (specialty) {
      query.specialty = specialty;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    if (sortBy === 'fee') {
      sortOptions.consultationFee = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sortOptions.rating = -1;
    } else if (sortBy === 'experience') {
      sortOptions.experience = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .sort(sortOptions)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: doctors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching doctors' });
  }
};

// @desc    Get single doctor details
// @route   GET /api/appointments/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    await trySyncDoctorDirectory();
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get available slots for a doctor on a date
// @route   GET /api/appointments/doctors/:id/availability
// @access  Public
const getDoctorAvailability = async (req, res) => {
  try {
    await trySyncDoctorDirectory();
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required' });
    }

    const slots = await getAvailableSlots(req.params.id, date);

    res.json({ 
      success: true, 
      data: { 
        doctorId: req.params.id, 
        date, 
        slots 
      } 
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all specialties
// @route   GET /api/appointments/specialties
// @access  Public
const getSpecialties = async (req, res) => {
  try {
    await trySyncDoctorDirectory();
    const specialties = await Doctor.distinct('specialty', { isAvailable: true });
    
    // Get count per specialty
    const specialtyCounts = await Doctor.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$specialty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ 
      success: true, 
      data: specialtyCounts.map(s => ({ name: s._id, count: s.count }))
    });
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// APPOINTMENT CRUD ENDPOINTS
// ============================================================

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Patient (authenticated)
const createAppointment = async (req, res) => {
  try {
    await trySyncDoctorDirectory();
    const { doctorId, appointmentDate, timeSlot, reason, notes, patientName, patientEmail, patientPhone } = req.body;

    // Validate doctor availability
    const availabilityCheck = await validateDoctorAvailability(doctorId, appointmentDate, timeSlot);
    if (!availabilityCheck.isValid) {
      return res.status(400).json({ success: false, message: availabilityCheck.message });
    }

    // Validate advance booking
    const advanceCheck = validateAdvanceBooking(appointmentDate, timeSlot);
    if (!advanceCheck.isValid) {
      return res.status(400).json({ success: false, message: advanceCheck.message });
    }

    // Check for double booking
    const doubleBookCheck = await checkDoubleBooking(doctorId, appointmentDate, timeSlot);
    if (doubleBookCheck.isConflict) {
      return res.status(409).json({ success: false, message: doubleBookCheck.message });
    }

    const doctor = availabilityCheck.doctor;

    const appointment = new Appointment({
      patientId: req.user ? req.user.userId : 'guest',
      patientName: patientName || (req.user ? req.user.name : 'Guest'),
      patientEmail: patientEmail || (req.user ? req.user.email : ''),
      patientPhone: patientPhone || '',
      doctorId,
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      doctorExternalId: doctor.externalDoctorId || String(doctor._id),
      specialty: doctor.specialty,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      notes: notes || '',
      consultationFee: doctor.consultationFee,
      currency: doctor.currency || 'LKR',
      status: 'pending'
    });

    await appointment.save();

    res.status(201).json({ 
      success: true, 
      message: 'Appointment booked successfully',
      data: appointment 
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }
    res.status(500).json({ success: false, message: 'Server error booking appointment' });
  }
};

// @desc    Get logged-in patient's appointments
// @route   GET /api/appointments/my-appointments
// @access  Patient (authenticated)
const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { patientId: req.user.userId };
    
    if (status) {
      query.status = status;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ 
      success: true, 
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Patient/Doctor/Admin
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check access: patient can see own, doctor can see assigned, admin can see all
    if (req.user.role === 'patient' && appointment.patientId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'doctor' && appointment.doctorEmail !== req.user.email?.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Modify appointment (reschedule)
// @route   PUT /api/appointments/:id
// @access  Patient
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && appointment.patientId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot modify ${appointment.status} appointment` });
    }

    const { appointmentDate, timeSlot, reason, notes } = req.body;

    // If rescheduling, validate new slot
    if (appointmentDate && timeSlot) {
      const availabilityCheck = await validateDoctorAvailability(appointment.doctorId, appointmentDate, timeSlot);
      if (!availabilityCheck.isValid) {
        return res.status(400).json({ success: false, message: availabilityCheck.message });
      }

      const advanceCheck = validateAdvanceBooking(appointmentDate, timeSlot);
      if (!advanceCheck.isValid) {
        return res.status(400).json({ success: false, message: advanceCheck.message });
      }

      const doubleBookCheck = await checkDoubleBooking(appointment.doctorId, appointmentDate, timeSlot, appointment._id);
      if (doubleBookCheck.isConflict) {
        return res.status(409).json({ success: false, message: doubleBookCheck.message });
      }

      appointment.appointmentDate = new Date(appointmentDate);
      appointment.timeSlot = timeSlot;
    }

    if (reason) appointment.reason = reason;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    res.json({ 
      success: true, 
      message: 'Appointment updated successfully',
      data: appointment 
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Patient/Doctor
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel ${appointment.status} appointment` });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || 'No reason provided';
    appointment.cancelledBy = req.user.role;
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({ 
      success: true, 
      message: 'Appointment cancelled successfully',
      data: appointment 
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Doctor/Admin
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'rejected', 'rescheduled', 'in-progress', 'completed', 'no-show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}` 
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'doctor' && appointment.doctorEmail !== req.user.email?.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot update cancelled appointment' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ 
      success: true, 
      message: `Appointment status updated to ${status}`,
      data: appointment 
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get appointments assigned to the logged-in doctor
// @route   GET /api/appointments/doctor/:id
// @access  Doctor/Admin
const getDoctorAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'doctor') {
      query = { doctorEmail: req.user.email?.toLowerCase() };
    } else {
      query = {
        $or: [
          { doctorId: req.params.id },
          { doctorExternalId: req.params.id }
        ]
      };
    }

    const appointments = await Appointment.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update appointment payment status (called by Payment Service)
// @route   PUT /api/appointments/:id/payment-status
// @access  Internal / System
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, paymentStatus } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.paymentId = paymentId;
    appointment.paymentStatus = paymentStatus;

    // Auto-confirm on payment
    if (paymentStatus === 'paid' && appointment.status === 'pending') {
      appointment.status = 'confirmed';
    }

    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

// @desc    Get all appointments (admin)
// @route   GET /api/appointments/admin/all
// @access  Admin
const getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = {};

    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Get stats
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: appointments,
      stats: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Admin get all error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Admin force-cancel appointment
// @route   PUT /api/appointments/admin/:id/cancel
// @access  Admin
const adminCancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || 'Cancelled by admin';
    appointment.cancelledBy = 'admin';
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({ 
      success: true, 
      message: 'Appointment cancelled by admin',
      data: appointment 
    });
  } catch (error) {
    console.error('Admin cancel error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getSpecialties,
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  updatePaymentStatus,
  getAllAppointments,
  adminCancelAppointment
};

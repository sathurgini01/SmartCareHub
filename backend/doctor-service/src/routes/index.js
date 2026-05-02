const express = require('express');
const doctorRoutes = require('./doctorRoutes');
const availabilityRoutes = require('./availabilityRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');
const adminRoutes = require('./adminRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/doctors', doctorRoutes);
router.use('/availability', availabilityRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/doctors/auth', authRoutes);

module.exports = router;

const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/doctor/:id', authenticate, authorize('doctor', 'admin'), appointmentController.getAssignedAppointments);

module.exports = router;
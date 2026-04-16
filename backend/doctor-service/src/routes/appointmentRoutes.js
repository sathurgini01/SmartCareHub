const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/doctor/:id', authenticate, authorize('doctor', 'admin'), appointmentController.getAssignedAppointments);
router.patch('/:id/status', authenticate, authorize('doctor', 'admin'), appointmentController.updateAppointmentStatus);
router.patch('/:id/reschedule', authenticate, authorize('doctor', 'admin'), appointmentController.rescheduleAppointment);

module.exports = router;

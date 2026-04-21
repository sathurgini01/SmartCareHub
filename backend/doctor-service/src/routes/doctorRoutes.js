const express = require('express');
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public', doctorController.getPublicDoctors);
router.get('/public/:id', doctorController.getPublicDoctorById);
router.get('/me', authenticate, authorize('doctor', 'admin'), doctorController.getMyDoctorProfile);
router.get('/:id', authenticate, authorize('doctor', 'admin'), doctorController.getDoctorProfile);
router.put('/:id', authenticate, authorize('doctor', 'admin'), doctorController.updateDoctorProfile);
router.delete('/:id', authenticate, authorize('doctor', 'admin'), doctorController.deleteDoctorAccount);

module.exports = router;

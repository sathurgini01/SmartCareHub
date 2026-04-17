const express = require('express');
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public', doctorController.listPublicDoctors);
router.get('/public/:id', doctorController.getPublicDoctorProfile);
router.get('/me', authenticate, authorize('doctor', 'admin'), doctorController.getMyDoctorProfile);
router.get('/:id', authenticate, authorize('doctor', 'admin'), doctorController.getDoctorProfile);
router.put('/:id', authenticate, authorize('doctor', 'admin'), doctorController.updateDoctorProfile);
router.delete('/:id', authenticate, authorize('doctor', 'admin'), doctorController.deleteDoctorAccount);

module.exports = router;

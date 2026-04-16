const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/doctors', authenticate, authorize('admin'), adminController.getAllDoctors);
router.put('/doctors/approve/:id', authenticate, authorize('admin'), adminController.approveDoctor);
router.put('/doctors/reject/:id', authenticate, authorize('admin'), adminController.rejectDoctor);

module.exports = router;
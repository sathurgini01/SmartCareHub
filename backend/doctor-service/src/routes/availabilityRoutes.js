const express = require('express');
const availabilityController = require('../controllers/availabilityController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('doctor', 'admin'), availabilityController.addAvailability);
router.get('/:doctorId', authenticate, authorize('doctor', 'admin'), availabilityController.viewAvailability);
router.put('/:id', authenticate, authorize('doctor', 'admin'), availabilityController.updateAvailability);
router.delete('/:id', authenticate, authorize('doctor', 'admin'), availabilityController.deleteAvailability);

module.exports = router;
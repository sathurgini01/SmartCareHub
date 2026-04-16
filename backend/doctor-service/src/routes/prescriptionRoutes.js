const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('doctor', 'admin'), prescriptionController.createPrescription);
router.put('/:id', authenticate, authorize('doctor', 'admin'), prescriptionController.updatePrescription);
router.delete('/:id', authenticate, authorize('doctor', 'admin'), prescriptionController.deletePrescription);
router.get('/:doctorId', authenticate, authorize('doctor', 'admin'), prescriptionController.viewPrescriptionHistory);

module.exports = router;
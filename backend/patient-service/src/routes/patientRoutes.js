const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const patientController = require('../controllers/patientController');

// ✅ ROOT CHECK ROUTE
router.get("/", (req, res) => {
  res.json({
    service: "Patient Service",
    status: "Running"
  });
});

// Create patient profile
router.post('/create-profile', verifyToken, authorizeRoles('PATIENT'), patientController.createProfile);

// Get current user's profile
router.get('/me', verifyToken, authorizeRoles('PATIENT'), patientController.getMyProfile);

// Update current user's profile
router.put('/me', verifyToken, authorizeRoles('PATIENT'), patientController.updateProfile);

// Delete current user's profile
router.delete('/me', verifyToken, authorizeRoles('PATIENT'), patientController.deleteProfile);

// Upload medical report
router.post('/upload-report', verifyToken, authorizeRoles('PATIENT'), upload.single('report'), patientController.uploadReport);

// Get all patients (Admin only)
router.get('/admin/all', verifyToken, authorizeRoles('ADMIN'), patientController.getAllPatients);

// Suspend patient (Admin only)
router.patch('/admin/suspend/:id', verifyToken, authorizeRoles('ADMIN'), patientController.suspendPatient);

module.exports = router;
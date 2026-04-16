const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const patientController = require('../controllers/patientController');

// ── Health check ────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({ service: 'Patient Service', status: 'Running' });
});

// ── Patient routes ──────────────────────────────────────────────────────────

// Create patient profile
router.post(
  '/create-profile',
  verifyToken,
  authorizeRoles('patient'),
  patientController.createProfile
);

// Get own profile
router.get('/me', verifyToken, authorizeRoles('patient'), patientController.getMyProfile);

// Update own profile
router.put('/me', verifyToken, authorizeRoles('patient'), patientController.updateProfile);

// Delete own account
router.delete('/me', verifyToken, authorizeRoles('patient'), patientController.deleteProfile);

// Upload medical report
router.post(
  '/upload-report',
  verifyToken,
  authorizeRoles('patient'),
  upload.single('report'),
  patientController.uploadReport
);

// Get own reports
router.get('/reports', verifyToken, authorizeRoles('patient'), patientController.getReports);

// Get own prescriptions
router.get(
  '/prescriptions',
  verifyToken,
  authorizeRoles('patient'),
  patientController.getPrescriptions
);

// Get own appointments (stub for Appointment Service integration)
router.get(
  '/appointments',
  verifyToken,
  authorizeRoles('patient'),
  patientController.getAppointments
);

// Get full medical history
router.get(
  '/medical-history',
  verifyToken,
  authorizeRoles('patient'),
  patientController.getMedicalHistory
);

// ── Admin routes ────────────────────────────────────────────────────────────

// Get all patients
router.get(
  '/admin/all',
  verifyToken,
  authorizeRoles('admin'),
  patientController.getAllPatients
);

// Suspend a patient
router.patch(
  '/admin/suspend/:id',
  verifyToken,
  authorizeRoles('admin'),
  patientController.suspendPatient
);

// Delete a patient
router.delete(
  '/admin/delete/:id',
  verifyToken,
  authorizeRoles('admin'),
  patientController.deletePatient
);

module.exports = router;

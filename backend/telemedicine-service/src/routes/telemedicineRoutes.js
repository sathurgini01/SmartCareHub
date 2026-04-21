const express = require("express");
const {
  createSession,
  getSessionByAppointment,
  getSessionById,
  getSessionConnection,
  joinSession,
  endSession,
  cancelSession,
  saveConsultationNotes,
  issuePrescription,
  getMySessions,
  getAllSessionLogs,
} = require("../controllers/telemedicineController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Internal/doctor: create or retrieve a video consultation session for an appointment.
router.post("/sessions", protect, restrictTo("admin", "doctor", "system"), createSession);

// Patient or doctor: fetch session by appointment
router.get("/sessions/appointment/:appointmentId", protect, restrictTo("patient", "doctor", "admin"), getSessionByAppointment);

// Patient or doctor: generate video-provider connection details for Jitsi, Twilio, or Agora
router.get("/sessions/:sessionId/connection", protect, restrictTo("patient", "doctor"), getSessionConnection);

// Patient, doctor, or admin: fetch a session by id
router.get("/sessions/:sessionId", protect, restrictTo("patient", "doctor", "admin"), getSessionById);

// Patient or doctor: join a session
router.post("/sessions/:sessionId/join", protect, restrictTo("patient", "doctor"), joinSession);

// Doctor/admin: save consultation notes
router.patch("/sessions/:sessionId/notes", protect, restrictTo("doctor", "admin"), saveConsultationNotes);

// Doctor/admin: mark prescription metadata against the session
router.post("/sessions/:sessionId/prescription", protect, restrictTo("doctor", "admin"), issuePrescription);

// Doctor/admin: end a session
router.patch("/sessions/:sessionId/end", protect, restrictTo("doctor", "admin"), endSession);

// Doctor or admin: cancel a session
router.patch("/sessions/:sessionId/cancel", protect, restrictTo("doctor", "admin"), cancelSession);

// Patient or doctor: list own sessions
router.get("/my-sessions", protect, restrictTo("patient", "doctor"), getMySessions);

// Admin: all session logs
router.get("/admin/logs", protect, restrictTo("admin"), getAllSessionLogs);

module.exports = router;

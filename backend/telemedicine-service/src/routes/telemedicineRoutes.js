const express = require("express");
const {
  createSession,
  getSessionByAppointment,
  joinSession,
  endSession,
  cancelSession,
  getMySessions,
  getAllSessionLogs,
} = require("../controllers/telemedicineController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Internal: create a session (called by appointment-service with admin/system token)
router.post("/sessions", protect, restrictTo("admin", "doctor"), createSession);

// Patient or doctor: fetch session by appointment
router.get("/sessions/appointment/:appointmentId", protect, restrictTo("patient", "doctor", "admin"), getSessionByAppointment);

// Patient or doctor: join a session
router.post("/sessions/:sessionId/join", protect, restrictTo("patient", "doctor"), joinSession);

// Doctor: end a session
router.patch("/sessions/:sessionId/end", protect, restrictTo("doctor", "admin"), endSession);

// Doctor or admin: cancel a session
router.patch("/sessions/:sessionId/cancel", protect, restrictTo("doctor", "admin"), cancelSession);

// Patient or doctor: list own sessions
router.get("/my-sessions", protect, restrictTo("patient", "doctor"), getMySessions);

// Admin: all session logs
router.get("/admin/logs", protect, restrictTo("admin"), getAllSessionLogs);

module.exports = router;

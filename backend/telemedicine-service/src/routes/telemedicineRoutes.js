const express = require("express");
const {
  createSession,
  getSessionByAppointment,
  joinSession,
  endSession,
  getMySessions,
  getAllSessionLogs,
} = require("../controllers/telemedicineController");

const router = express.Router();

router.post("/sessions", createSession);
router.get("/sessions/appointment/:appointmentId", getSessionByAppointment);
router.post("/sessions/:sessionId/join", joinSession);
router.patch("/sessions/:sessionId/end", endSession);
router.get("/my-sessions", getMySessions);
router.get("/admin/logs", getAllSessionLogs);

module.exports = router;
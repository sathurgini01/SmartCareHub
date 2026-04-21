const express = require("express");
const {
  checkSymptoms,
  getSymptomHistory,
  getSymptomQueryById,
  deleteSymptomQuery,
  escalateSymptomCheck,
  createSymptomNotification,
  recommendConsultation,
  getAllAiLogs,
} = require("../controllers/aiSymptomController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Patient: submit symptoms for AI analysis
router.post("/check", protect, restrictTo("patient"), checkSymptoms);

// Patient: view own symptom check history
router.get("/history", protect, restrictTo("patient", "admin"), getSymptomHistory);
router.get("/history/:analysisId", protect, restrictTo("patient", "admin"), getSymptomQueryById);
router.delete("/history/:analysisId", protect, restrictTo("patient", "admin"), deleteSymptomQuery);

router.post("/check/:analysisId/escalate", protect, restrictTo("patient", "doctor", "admin"), escalateSymptomCheck);
router.post("/check/:analysisId/create-notification", protect, restrictTo("patient", "doctor", "admin"), createSymptomNotification);
router.post("/check/:analysisId/recommend-consultation", protect, restrictTo("patient", "doctor", "admin"), recommendConsultation);

// Admin: view all AI query logs
router.get("/admin/logs", protect, restrictTo("admin"), getAllAiLogs);

// Patient or admin: fetch a specific query by ID (must come after /admin/logs)
router.get("/:queryId", protect, restrictTo("patient", "admin"), getSymptomQueryById);

module.exports = router;

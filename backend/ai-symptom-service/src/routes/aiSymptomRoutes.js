const express = require("express");
const {
  checkSymptoms,
  getSymptomHistory,
  getSymptomQueryById,
  getAllAiLogs,
} = require("../controllers/aiSymptomController");

const router = express.Router();

router.post("/check", checkSymptoms);
router.get("/history", getSymptomHistory);
router.get("/admin/logs", getAllAiLogs);
router.get("/:queryId", getSymptomQueryById);

module.exports = router;
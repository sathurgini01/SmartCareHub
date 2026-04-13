const express = require("express");
const {
  sendEmailNotification,
  sendSmsNotification,
  getMyNotifications,
  getNotificationById,
  getAllNotificationLogs,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/send-email", sendEmailNotification);
router.post("/send-sms", sendSmsNotification);
router.get("/me", getMyNotifications);
router.get("/admin/logs", getAllNotificationLogs);
router.get("/:notificationId", getNotificationById);

module.exports = router;
const express = require("express");
const {
  sendEmailNotification,
  sendSmsNotification,
  getMyNotifications,
  getNotificationById,
  getAllNotificationLogs,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// Send email (called by other services using admin/system token)
router.post("/send-email", protect, restrictTo("admin", "doctor", "patient"), sendEmailNotification);

// Send SMS (called by other services using admin/system token)
router.post("/send-sms", protect, restrictTo("admin", "doctor", "patient"), sendSmsNotification);

// Patient or doctor: view own notifications
router.get("/me", protect, restrictTo("patient", "doctor", "admin"), getMyNotifications);

// Mark as read
router.patch("/:notificationId/read", protect, restrictTo("patient", "doctor", "admin"), markAsRead);

// Delete notification
router.delete("/:notificationId", protect, restrictTo("patient", "doctor", "admin"), deleteNotification);

// Any authenticated user: view a specific notification by ID
router.get("/admin/logs", protect, restrictTo("admin"), getAllNotificationLogs);

// Must come after /admin/logs to avoid route conflict
router.get("/:notificationId", protect, restrictTo("patient", "doctor", "admin"), getNotificationById);

module.exports = router;

const Notification = require("../models/Notification");
const { sendEmail } = require("../utils/emailSender");
const { sendSms } = require("../utils/smsSender");

const sendEmailNotification = async (req, res) => {
  try {
    const { userId, appointmentId, recipientEmail, subject, message, category, title } = req.body;

    if (!userId || !recipientEmail || !message || !category) {
      return res.status(400).json({
        success: false,
        message: "userId, recipientEmail, category, and message are required",
      });
    }

    let status = "sent";
    let provider = process.env.EMAIL_PROVIDER || "gmail";

    try {
      await sendEmail({
        to: recipientEmail,
        subject: subject || "SmartCareHub Notification",
        text: message,
      });
    } catch (sendError) {
      console.error("Email delivery failed:", sendError.message);
      status = "failed";
    }

    const notification = await Notification.create({
      userId,
      appointmentId: appointmentId || null,
      type: "email",
      category,
      recipientEmail,
      subject: subject || "SmartCareHub Notification",
      message,
      status,
      provider,
      sentAt: new Date(),
      title: title || subject || "SmartCareHub Notification",
    });

    return res.status(201).json({
      success: true,
      message: status === "sent"
        ? "Email notification sent successfully"
        : "Email notification logged but delivery failed",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process email notification",
      error: error.message,
    });
  }
};

const sendSmsNotification = async (req, res) => {
  try {
    const { userId, appointmentId, recipientPhone, message, category, title } = req.body;

    if (!userId || !recipientPhone || !message || !category) {
      return res.status(400).json({
        success: false,
        message: "userId, recipientPhone, category, and message are required",
      });
    }

    let status = "sent";
    const provider = "twilio";

    try {
      await sendSms({ to: recipientPhone, message });
    } catch (sendError) {
      console.error("SMS delivery failed:", sendError.message);
      status = "failed";
    }

    const notification = await Notification.create({
      userId,
      appointmentId: appointmentId || null,
      type: "sms",
      category,
      recipientPhone,
      message,
      status,
      provider,
      sentAt: new Date(),
      title: title || "SmartCareHub SMS",
    });

    return res.status(201).json({
      success: true,
      message: status === "sent"
        ? "SMS notification sent successfully"
        : "SMS notification logged but delivery failed",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process SMS notification",
      error: error.message,
    });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    // Priority: req.user.id (from token) then req.query.userId (fallback for system calls if needed)
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

const getAllNotificationLogs = async (_req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification logs",
      error: error.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to mark as read", error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete notification", error: error.message });
  }
};

module.exports = {
  sendEmailNotification,
  sendSmsNotification,
  getMyNotifications,
  getNotificationById,
  getAllNotificationLogs,
  markAsRead,
  deleteNotification,
};

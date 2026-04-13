const Notification = require("../models/Notification");

const sendEmailNotification = async (req, res) => {
  try {
    const { userId, appointmentId, recipientEmail, subject, message, category } = req.body;

    if (!userId || !recipientEmail || !message || !category) {
      return res.status(400).json({
        success: false,
        message: "userId, recipientEmail, category, and message are required",
      });
    }

    const notification = await Notification.create({
      userId,
      appointmentId: appointmentId || null,
      type: "email",
      category,
      recipientEmail,
      subject: subject || "SmartCareHub Notification",
      message,
      status: "sent",
      provider: "mock",
      sentAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Email notification sent successfully",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send email notification",
      error: error.message,
    });
  }
};

const sendSmsNotification = async (req, res) => {
  try {
    const { userId, appointmentId, recipientPhone, message, category } = req.body;

    if (!userId || !recipientPhone || !message || !category) {
      return res.status(400).json({
        success: false,
        message: "userId, recipientPhone, category, and message are required",
      });
    }

    const notification = await Notification.create({
      userId,
      appointmentId: appointmentId || null,
      type: "sms",
      category,
      recipientPhone,
      message,
      status: "sent",
      provider: "mock",
      sentAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "SMS notification sent successfully",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send SMS notification",
      error: error.message,
    });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId query parameter is required",
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

const getAllNotificationLogs = async (req, res) => {
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

module.exports = {
  sendEmailNotification,
  sendSmsNotification,
  getMyNotifications,
  getNotificationById,
  getAllNotificationLogs,
};
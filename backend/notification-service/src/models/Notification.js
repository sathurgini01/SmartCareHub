const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
      trim: true,
    },
    appointmentId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      default: "System Notification",
      trim: true,
    },
    type: {
      type: String,
      enum: ["email", "sms"],
      required: [true, "Notification type is required"],
    },
    category: {
      type: String,
      enum: [
        "booking_confirmation", 
        "booking_status_update",
        "consultation_reminder", 
        "consultation_completion",
        "system_alert",
        "account_verification"
      ],
      required: [true, "Notification category is required"],
    },
    recipientEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    recipientPhone: {
      type: String,
      default: null,
      trim: true,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "sent",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: "mock",
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
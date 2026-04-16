const mongoose = require("mongoose");

const telemedicineSessionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: [true, "Appointment ID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
      index: true,
      trim: true,
    },
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
      index: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["jitsi", "twilio", "agora"],
      default: "jitsi",
    },
    sessionLink: {
      type: String,
      required: [true, "Session link is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["created", "active", "ended", "cancelled"],
      default: "created",
      index: true,
    },
    scheduledStartTime: {
      type: Date,
      required: [true, "Scheduled start time is required"],
    },
    actualStartTime: {
      type: Date,
      default: null,
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    patientJoined: {
      type: Boolean,
      default: false,
    },
    doctorJoined: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: "appointment-service",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelemedicineSession", telemedicineSessionSchema);
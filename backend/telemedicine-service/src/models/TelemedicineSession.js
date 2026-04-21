const crypto = require("crypto");
const mongoose = require("mongoose");

const sanitizeRoomName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const buildFallbackRoom = (appointmentId) =>
  sanitizeRoomName(`smartcare-${appointmentId}-${crypto.randomBytes(5).toString("hex")}`);

const buildFallbackLink = (room) =>
  `${(process.env.JITSI_BASE_URL || "https://meet.jit.si").replace(/\/$/, "")}/${room}`;

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
    sessionType: {
      type: String,
      enum: ["video", "audio", "chat"],
      default: "video",
      index: true,
    },
    specialty: {
      type: String,
      default: "General Medicine",
      trim: true,
    },
    doctorName: {
      type: String,
      default: "",
      trim: true,
    },
    patientName: {
      type: String,
      default: "",
      trim: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    sessionRoom: {
      type: String,
      required: [true, "Session room is required"],
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    sessionLink: {
      type: String,
      required: [true, "Session link is required"],
      trim: true,
    },
    accessCode: {
      type: String,
      required: [true, "Access code is required"],
      trim: true,
      select: false,
    },
    status: {
      type: String,
      enum: ["created", "scheduled", "waiting", "active", "ended", "cancelled"],
      default: "scheduled",
      index: true,
    },
    scheduledStartTime: {
      type: Date,
      required: [true, "Scheduled start time is required"],
    },
    scheduledEndTime: {
      type: Date,
      default: null,
    },
    firstJoinTime: {
      type: Date,
      default: null,
    },
    actualStartTime: {
      type: Date,
      default: null,
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    patientJoined: {
      type: Boolean,
      default: false,
    },
    doctorJoined: {
      type: Boolean,
      default: false,
    },
    patientJoinedAt: {
      type: Date,
      default: null,
    },
    doctorJoinedAt: {
      type: Date,
      default: null,
    },
    lastJoinedBy: {
      type: String,
      enum: ["patient", "doctor", null],
      default: null,
    },
    endedBy: {
      type: String,
      default: "",
      trim: true,
    },
    cancelledBy: {
      type: String,
      default: "",
      trim: true,
    },
    cancelReason: {
      type: String,
      default: "",
      trim: true,
    },
    consultationNotes: {
      type: String,
      default: "",
      trim: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    prescription: {
      status: {
        type: String,
        enum: ["not_issued", "draft", "issued"],
        default: "not_issued",
      },
      prescriptionId: {
        type: String,
        default: "",
        trim: true,
      },
      issuedAt: {
        type: Date,
        default: null,
      },
      items: {
        type: [String],
        default: [],
      },
    },
    createdBy: {
      type: String,
      default: "appointment-service",
      trim: true,
    },
  },
  { timestamps: true }
);

telemedicineSessionSchema.index({ doctorId: 1, scheduledStartTime: -1 });
telemedicineSessionSchema.index({ patientId: 1, scheduledStartTime: -1 });

telemedicineSessionSchema.pre("validate", function fillSessionAccessFields(next) {
  if (!this.sessionRoom) this.sessionRoom = buildFallbackRoom(this.appointmentId);
  if (!this.sessionLink) this.sessionLink = buildFallbackLink(this.sessionRoom);
  if (!this.accessCode) this.accessCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  next();
});

module.exports = mongoose.model("TelemedicineSession", telemedicineSessionSchema);

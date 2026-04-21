const crypto = require("crypto");

const sanitizeRoomName = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const createAccessCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

const createSessionRoom = (appointmentId) => {
  const safeAppointment = sanitizeRoomName(appointmentId);
  const entropy = crypto.randomBytes(5).toString("hex");
  return sanitizeRoomName(`smartcare-${safeAppointment}-${entropy}`);
};

const generateMeetingLink = (sessionRoom) => {
  const provider = process.env.VIDEO_PROVIDER || "jitsi";
  const safeRoom = sanitizeRoomName(sessionRoom);

  if (provider === "mock") {
    return `${process.env.FRONTEND_URL || "http://localhost:3000"}/telemedicine/mock/${safeRoom}`;
  }

  const baseUrl = process.env.JITSI_BASE_URL || "https://meet.jit.si";
  return `${baseUrl.replace(/\/$/, "")}/${safeRoom}`;
};

module.exports = {
  createAccessCode,
  createSessionRoom,
  generateMeetingLink,
  sanitizeRoomName,
};

const sanitizeRoomName = (value) => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const generateMeetingLink = (appointmentId) => {
  const safeRoom = sanitizeRoomName(`smartcare-${appointmentId}`);
  return `https://meet.jit.si/${safeRoom}`;
};

module.exports = { generateMeetingLink };
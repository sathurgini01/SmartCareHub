const TelemedicineSession = require("../models/TelemedicineSession");
const {
  createAccessCode,
  createSessionRoom,
  generateMeetingLink,
} = require("../utils/generateMeetingLink");
const { buildVideoConnection } = require("../utils/videoProvider");

const getUserId = (req) =>
  String(req.user?.userId || req.user?.id || req.user?._id || req.user?.sub || "");

const getUserRole = (req) => String(req.user?.role || "").toLowerCase();

const getAuthHeader = (req) => req.headers.authorization || "";

const normalizeProvider = (provider) => {
  const requested = provider || process.env.VIDEO_PROVIDER || "jitsi";
  return ["jitsi", "twilio", "agora"].includes(requested) ? requested : "jitsi";
};

const calculateDurationMinutes = (start, end) => {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.ceil(diff / 60000));
};

const buildSessionPayload = (body, req) => {
  const sessionRoom = createSessionRoom(body.appointmentId);

  return {
    appointmentId: body.appointmentId,
    doctorId: body.doctorId,
    patientId: body.patientId,
    doctorName: body.doctorName || "",
    patientName: body.patientName || "",
    specialty: body.specialty || "General Medicine",
    reason: body.reason || "",
    sessionType: body.sessionType || "video",
    provider: normalizeProvider(body.provider),
    sessionRoom,
    sessionLink: generateMeetingLink(sessionRoom),
    accessCode: createAccessCode(),
    scheduledStartTime: body.scheduledStartTime,
    scheduledEndTime: body.scheduledEndTime || null,
    createdBy: body.createdBy || getUserId(req) || "telemedicine-service",
  };
};

const canAccessSession = (req, session) => {
  const role = getUserRole(req);
  const userId = getUserId(req);

  if (role === "admin") return true;
  if (role === "doctor") return String(session.doctorId) === userId;
  if (role === "patient") return String(session.patientId) === userId;
  return false;
};

const ensureSessionAccess = (req, res, session) => {
  if (!session) {
    res.status(404).json({
      success: false,
      message: "Telemedicine session not found",
    });
    return false;
  }

  if (!canAccessSession(req, session)) {
    res.status(403).json({
      success: false,
      message: "Forbidden: You are not assigned to this telemedicine session",
    });
    return false;
  }

  return true;
};

const notifyTelemedicineEvent = async (req, session, event, message) => {
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
  if (!baseUrl || typeof fetch !== "function") return;

  const authorization = getAuthHeader(req);
  if (!authorization) return;

  const recipients = [
    {
      userId: session.patientId,
      recipientEmail: req.body.patientEmail,
    },
    {
      userId: session.doctorId,
      recipientEmail: req.body.doctorEmail,
    },
  ].filter((recipient) => recipient.recipientEmail);

  await Promise.allSettled(
    recipients.map((recipient) =>
      fetch(`${baseUrl.replace(/\/$/, "")}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify({
          userId: recipient.userId,
          appointmentId: session.appointmentId,
          recipientEmail: recipient.recipientEmail,
          category: "consultation_reminder",
          subject: `SmartCareHub Telemedicine ${event}`,
          message,
        }),
      })
    )
  );
};

const createSession = async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, scheduledStartTime } = req.body;

    if (!appointmentId || !doctorId || !patientId || !scheduledStartTime) {
      return res.status(400).json({
        success: false,
        message: "appointmentId, doctorId, patientId, and scheduledStartTime are required",
      });
    }

    const scheduledDate = new Date(scheduledStartTime);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "scheduledStartTime must be a valid date/time",
      });
    }

    const role = getUserRole(req);
    const userId = getUserId(req);
    if (role === "doctor" && String(doctorId) !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Doctors can create sessions only for their own appointments",
      });
    }

    const existingSession = await TelemedicineSession.findOne({ appointmentId });
    if (existingSession) {
      return res.status(200).json({
        success: true,
        message: "Telemedicine session already exists for this appointment",
        data: existingSession,
      });
    }

    const session = await TelemedicineSession.create(buildSessionPayload(req.body, req));

    notifyTelemedicineEvent(
      req,
      session,
      "Scheduled",
      `Your video consultation for appointment ${session.appointmentId} has been scheduled.`
    ).catch(() => null);

    return res.status(201).json({
      success: true,
      message: "Telemedicine session created successfully",
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create telemedicine session",
      error: error.message,
    });
  }
};

const getSessionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const session = await TelemedicineSession.findOne({ appointmentId });

    if (!ensureSessionAccess(req, res, session)) return null;

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch telemedicine session",
      error: error.message,
    });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.sessionId);
    if (!ensureSessionAccess(req, res, session)) return null;

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch telemedicine session",
      error: error.message,
    });
  }
};

const getSessionConnection = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.sessionId);
    if (!ensureSessionAccess(req, res, session)) return null;

    if (session.status === "ended" || session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot connect to a ${session.status} telemedicine session`,
      });
    }

    const connection = buildVideoConnection(session, {
      role: getUserRole(req),
      userId: getUserId(req),
    });

    return res.status(200).json({
      success: true,
      message: connection.setupRequired
        ? `${connection.provider} provider configuration is incomplete`
        : "Video connection details generated successfully",
      data: connection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate video connection details",
      error: error.message,
    });
  }
};

const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const role = getUserRole(req);
    const requestedRole = String(req.body.role || role).toLowerCase();

    if (!["doctor", "patient"].includes(requestedRole) || requestedRole !== role) {
      return res.status(400).json({
        success: false,
        message: "Invalid role for this telemedicine join request",
      });
    }

    const session = await TelemedicineSession.findById(sessionId);
    if (!ensureSessionAccess(req, res, session)) return null;

    if (session.status === "ended" || session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot join a ${session.status} session`,
      });
    }

    const now = new Date();
    if (!session.firstJoinTime) session.firstJoinTime = now;

    if (role === "patient" && !session.patientJoined) {
      session.patientJoined = true;
      session.patientJoinedAt = now;
    }

    if (role === "doctor" && !session.doctorJoined) {
      session.doctorJoined = true;
      session.doctorJoinedAt = now;
    }

    session.lastJoinedBy = role;
    session.status = session.patientJoined && session.doctorJoined ? "active" : "waiting";

    if (session.status === "active" && !session.actualStartTime) {
      session.actualStartTime = now;
    }

    await session.save();

    notifyTelemedicineEvent(
      req,
      session,
      "Join",
      `${role === "doctor" ? "Doctor" : "Patient"} joined the telemedicine session for appointment ${session.appointmentId}.`
    ).catch(() => null);

    return res.status(200).json({
      success: true,
      message: "Joined telemedicine session successfully",
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to join telemedicine session",
      error: error.message,
    });
  }
};

const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await TelemedicineSession.findById(sessionId);
    if (!ensureSessionAccess(req, res, session)) return null;

    if (session.status === "ended") {
      return res.status(400).json({
        success: false,
        message: "Session already ended",
      });
    }

    if (session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot end a cancelled session",
      });
    }

    const now = new Date();
    session.status = "ended";
    session.actualEndTime = now;
    session.endedBy = getUserId(req);
    session.summary = req.body.summary || session.summary;
    session.consultationNotes = req.body.consultationNotes || req.body.notes || session.consultationNotes;
    session.durationMinutes = calculateDurationMinutes(session.actualStartTime || session.firstJoinTime, now);

    await session.save();

    notifyTelemedicineEvent(
      req,
      session,
      "Completed",
      `Your telemedicine session for appointment ${session.appointmentId} has been completed.`
    ).catch(() => null);

    return res.status(200).json({
      success: true,
      message: "Telemedicine session ended successfully",
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to end telemedicine session",
      error: error.message,
    });
  }
};

const cancelSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await TelemedicineSession.findById(sessionId);
    if (!ensureSessionAccess(req, res, session)) return null;

    if (session.status === "ended" || session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Session is already ${session.status}`,
      });
    }

    session.status = "cancelled";
    session.cancelReason = req.body.reason || req.body.cancelReason || "";
    session.cancelledBy = getUserId(req);
    await session.save();

    notifyTelemedicineEvent(
      req,
      session,
      "Cancelled",
      `Your telemedicine session for appointment ${session.appointmentId} has been cancelled.`
    ).catch(() => null);

    return res.status(200).json({
      success: true,
      message: "Telemedicine session cancelled successfully",
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel telemedicine session",
      error: error.message,
    });
  }
};

const saveConsultationNotes = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.sessionId);
    if (!ensureSessionAccess(req, res, session)) return null;

    if (getUserRole(req) !== "doctor" && getUserRole(req) !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only doctors can save consultation notes",
      });
    }

    session.consultationNotes = req.body.notes || req.body.consultationNotes || "";
    session.summary = req.body.summary || session.summary;
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Consultation notes saved successfully",
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save consultation notes",
      error: error.message,
    });
  }
};

const issuePrescription = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.sessionId);
    if (!ensureSessionAccess(req, res, session)) return null;

    if (getUserRole(req) !== "doctor" && getUserRole(req) !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only doctors can issue prescriptions",
      });
    }

    session.prescription = {
      status: "issued",
      prescriptionId: req.body.prescriptionId || session.prescription?.prescriptionId || "",
      issuedAt: new Date(),
      items: Array.isArray(req.body.items) ? req.body.items : session.prescription?.items || [],
    };

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Prescription marked as issued for this telemedicine session",
      data: session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to issue prescription",
      error: error.message,
    });
  }
};

const getMySessions = async (req, res) => {
  try {
    const role = getUserRole(req);
    const tokenUserId = getUserId(req);
    const requestedUserId = req.query.userId ? String(req.query.userId) : tokenUserId;

    if (requestedUserId !== tokenUserId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only view your own telemedicine sessions",
      });
    }

    const filter = role === "doctor"
      ? { doctorId: tokenUserId }
      : { patientId: tokenUserId };

    if (req.query.status) filter.status = req.query.status;

    const sessions = await TelemedicineSession.find(filter).sort({ scheduledStartTime: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};

const getAllSessionLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.patientId) filter.patientId = req.query.patientId;

    const sessions = await TelemedicineSession.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch session logs",
      error: error.message,
    });
  }
};

module.exports = {
  createSession,
  getSessionByAppointment,
  getSessionById,
  getSessionConnection,
  joinSession,
  endSession,
  cancelSession,
  saveConsultationNotes,
  issuePrescription,
  getMySessions,
  getAllSessionLogs,
};

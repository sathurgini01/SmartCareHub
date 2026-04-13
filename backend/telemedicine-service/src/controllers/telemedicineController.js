const TelemedicineSession = require("../models/TelemedicineSession");
const { generateMeetingLink } = require("../utils/generateMeetingLink");

const createSession = async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, scheduledStartTime, provider } = req.body;

    if (!appointmentId || !doctorId || !patientId || !scheduledStartTime) {
      return res.status(400).json({
        success: false,
        message: "appointmentId, doctorId, patientId, and scheduledStartTime are required",
      });
    }

    const existingSession = await TelemedicineSession.findOne({ appointmentId });

    if (existingSession) {
      return res.status(409).json({
        success: false,
        message: "A telemedicine session already exists for this appointment",
        data: existingSession,
      });
    }

    const session = await TelemedicineSession.create({
      appointmentId,
      doctorId,
      patientId,
      scheduledStartTime,
      provider: provider || "jitsi",
      sessionLink: generateMeetingLink(appointmentId),
    });

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

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No telemedicine session found for this appointment",
      });
    }

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

const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role } = req.body;

    if (!role || !["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required: patient or doctor",
      });
    }

    const session = await TelemedicineSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Telemedicine session not found",
      });
    }

    if (session.status === "ended" || session.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot join a ${session.status} session`,
      });
    }

    if (role === "patient") {
      session.patientJoined = true;
    }

    if (role === "doctor") {
      session.doctorJoined = true;
    }

    if (!session.actualStartTime) {
      session.actualStartTime = new Date();
    }

    session.status = "active";

    await session.save();

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

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Telemedicine session not found",
      });
    }

    if (session.status === "ended") {
      return res.status(400).json({
        success: false,
        message: "Session already ended",
      });
    }

    session.status = "ended";
    session.actualEndTime = new Date();

    await session.save();

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

const getMySessions = async (req, res) => {
  try {
    const { role, userId } = req.query;

    if (!role || !userId) {
      return res.status(400).json({
        success: false,
        message: "role and userId query parameters are required",
      });
    }

    let filter = {};

    if (role === "doctor") {
      filter.doctorId = userId;
    } else if (role === "patient") {
      filter.patientId = userId;
    } else {
      return res.status(400).json({
        success: false,
        message: "Role must be either doctor or patient",
      });
    }

    const sessions = await TelemedicineSession.find(filter).sort({ scheduledStartTime: 1 });

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
    const sessions = await TelemedicineSession.find().sort({ createdAt: -1 });

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
  joinSession,
  endSession,
  getMySessions,
  getAllSessionLogs,
};
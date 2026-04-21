const AiSymptomQuery = require("../models/AiSymptomQuery");
const { analyzeSymptoms } = require("../utils/analyzeSymptoms");

const DISCLAIMER =
  "This is a preliminary AI suggestion and not a medical diagnosis. Please consult a qualified doctor for proper medical advice.";

const checkSymptoms = async (req, res) => {
  try {
    const { patientId, symptoms, age, gender, duration, additionalNotes } = req.body;

    if (!patientId || !symptoms) {
      return res.status(400).json({
        success: false,
        message: "patientId and symptoms are required",
      });
    }

    if (symptoms.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Symptoms must contain at least 5 characters",
      });
    }

    const analysis = await analyzeSymptoms(symptoms, age, gender, duration, additionalNotes);

    const savedQuery = await AiSymptomQuery.create({
      patientId,
      symptoms,
      age: age ?? null,
      gender: gender ?? null,
      duration: duration || "",
      additionalNotes: additionalNotes || "",
      recommendedSpecialty: analysis.recommendedSpecialty,
      riskLevel: analysis.riskLevel,
      aiResponse: analysis.aiResponse,
      disclaimerShown: true,
      sourceModel: analysis.sourceModel || "rule-based-v1",
    });

    return res.status(201).json({
      success: true,
      message: "Symptom analysis completed successfully",
      data: {
        ...savedQuery.toObject(),
        disclaimer: DISCLAIMER,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to analyze symptoms",
      error: error.message,
    });
  }
};

const getSymptomHistory = async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId query parameter is required",
      });
    }

    const history = await AiSymptomQuery.find({ patientId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch symptom history",
      error: error.message,
    });
  }
};

const getSymptomQueryById = async (req, res) => {
  try {
    const queryId = req.params.queryId || req.params.analysisId;

    const query = await AiSymptomQuery.findById(queryId);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "AI symptom query not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...query.toObject(),
        disclaimer: DISCLAIMER,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI symptom query",
      error: error.message,
    });
  }
};

const deleteSymptomQuery = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const deletedQuery = await AiSymptomQuery.findByIdAndDelete(analysisId);

    if (!deletedQuery) {
      return res.status(404).json({
        success: false,
        message: "AI symptom query not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Symptom history deleted successfully",
      data: deletedQuery,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete symptom history",
      error: error.message,
    });
  }
};

const escalateSymptomCheck = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const query = await AiSymptomQuery.findById(analysisId);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "AI symptom query not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "High-risk symptom check escalated for clinical follow-up",
      data: {
        analysisId,
        patientId: query.patientId,
        riskLevel: query.riskLevel,
        recommendedSpecialty: query.recommendedSpecialty,
        status: "escalated",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to escalate symptom check",
      error: error.message,
    });
  }
};

const createSymptomNotification = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const query = await AiSymptomQuery.findById(analysisId);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "AI symptom query not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification event prepared for symptom analysis",
      data: {
        analysisId,
        patientId: query.patientId,
        category: "ai-symptom",
        riskLevel: query.riskLevel,
        recommendedSpecialty: query.recommendedSpecialty,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to prepare symptom notification",
      error: error.message,
    });
  }
};

const recommendConsultation = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const query = await AiSymptomQuery.findById(analysisId);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "AI symptom query not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Consultation recommendation created",
      data: {
        analysisId,
        specialty: query.recommendedSpecialty,
        bookingPath: `/doctors?specialty=${encodeURIComponent(query.recommendedSpecialty)}`,
        consultationType: query.riskLevel === "high" ? "urgent" : "standard",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to recommend consultation",
      error: error.message,
    });
  }
};

const getAllAiLogs = async (_req, res) => {
  try {
    const logs = await AiSymptomQuery.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI logs",
      error: error.message,
    });
  }
};

module.exports = {
  checkSymptoms,
  getSymptomHistory,
  getSymptomQueryById,
  deleteSymptomQuery,
  escalateSymptomCheck,
  createSymptomNotification,
  recommendConsultation,
  getAllAiLogs,
};

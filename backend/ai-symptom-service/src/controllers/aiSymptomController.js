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
    const { queryId } = req.params;

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
  getAllAiLogs,
};
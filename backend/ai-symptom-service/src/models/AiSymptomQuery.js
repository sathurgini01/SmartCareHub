const mongoose = require("mongoose");

const aiSymptomQuerySchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
      index: true,
      trim: true,
    },
    symptoms: {
      type: String,
      required: [true, "Symptoms are required"],
      trim: true,
    },
    age: {
      type: Number,
      default: null,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say", null],
      default: null,
    },
    duration: {
      type: String,
      default: "",
      trim: true,
    },
    additionalNotes: {
      type: String,
      default: "",
      trim: true,
    },
    recommendedSpecialty: {
      type: String,
      required: true,
      trim: true,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    aiResponse: {
      type: String,
      required: true,
      trim: true,
    },
    disclaimerShown: {
      type: Boolean,
      default: true,
    },
    sourceModel: {
      type: String,
      default: "rule-based-v1",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiSymptomQuery", aiSymptomQuerySchema);
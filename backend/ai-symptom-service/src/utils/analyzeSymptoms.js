const analyzeSymptoms = (symptomsText) => {
  const text = String(symptomsText || "").toLowerCase();

  if (text.includes("chest pain") || text.includes("palpitations")) {
    return {
      recommendedSpecialty: "Cardiology",
      riskLevel: "high",
      aiResponse:
        "Your symptoms may require urgent review by a cardiologist. Please seek medical advice as soon as possible.",
    };
  }

  if (text.includes("rash") || text.includes("skin")) {
    return {
      recommendedSpecialty: "Dermatology",
      riskLevel: "medium",
      aiResponse:
        "Your symptoms may be related to a skin condition. A dermatologist may be the most suitable specialist.",
    };
  }

  if (text.includes("headache") || text.includes("numbness") || text.includes("dizziness")) {
    return {
      recommendedSpecialty: "Neurology",
      riskLevel: "medium",
      aiResponse:
        "Your symptoms may require neurological evaluation. A neurologist may be appropriate for further assessment.",
    };
  }

  if (text.includes("cough") || text.includes("fever") || text.includes("cold")) {
    return {
      recommendedSpecialty: "General Medicine",
      riskLevel: "low",
      aiResponse:
        "Your symptoms may be consistent with a common general medical condition. A general physician is recommended.",
    };
  }

  return {
    recommendedSpecialty: "General Medicine",
    riskLevel: "low",
    aiResponse:
      "Based on the provided symptoms, a general physician is recommended for an initial consultation.",
  };
};

module.exports = { analyzeSymptoms };
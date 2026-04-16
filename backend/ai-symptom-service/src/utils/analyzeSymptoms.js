const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// ─── Gemini AI Analysis ───────────────────────────────────────────────────────

const analyzeWithGemini = async (symptoms, age, gender, duration, additionalNotes) => {
  const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.AI_MODEL || "gemini-2.0-flash",
  });

  const prompt = buildPrompt(symptoms, age, gender, duration, additionalNotes);
  const result = await model.generateContent(prompt);
  return parseJsonResponse(result.response.text().trim());
};

// ─── Groq AI Analysis ─────────────────────────────────────────────────────────

const analyzeWithGroq = async (symptoms, age, gender, duration, additionalNotes) => {
  const groq = new Groq({ apiKey: process.env.AI_API_KEY });

  const response = await groq.chat.completions.create({
    model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: buildPrompt(symptoms, age, gender, duration, additionalNotes),
      },
    ],
    temperature: 0.3,
  });

  return parseJsonResponse(response.choices[0].message.content.trim());
};

// ─── Shared Prompt Builder ────────────────────────────────────────────────────

const buildPrompt = (symptoms, age, gender, duration, additionalNotes) => {
  return `You are a medical triage assistant for SmartCareHub, a telemedicine platform.
A patient has described the following symptoms: "${symptoms}".
Additional context:
- Age: ${age || "not provided"}
- Gender: ${gender || "not provided"}
- Duration: ${duration || "not provided"}
- Additional notes: ${additionalNotes || "none"}

Respond ONLY with a valid JSON object using this exact structure (no markdown, no extra text):
{
  "recommendedSpecialty": "<specific medical specialty>",
  "riskLevel": "<low|medium|high>",
  "aiResponse": "<2-3 sentence preliminary health suggestion>"
}`;
};

const parseJsonResponse = (text) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned an unparseable response");

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.recommendedSpecialty || !parsed.riskLevel || !parsed.aiResponse) {
    throw new Error("AI response is missing required fields");
  }

  if (!["low", "medium", "high"].includes(parsed.riskLevel)) {
    parsed.riskLevel = "low";
  }

  return parsed;
};

// ─── Rule-based Fallback ──────────────────────────────────────────────────────

const analyzeWithRules = (symptomsText) => {
  const text = String(symptomsText || "").toLowerCase();

  if (text.includes("chest pain") || text.includes("palpitations") || text.includes("heart")) {
    return {
      recommendedSpecialty: "Cardiology",
      riskLevel: "high",
      aiResponse:
        "Your symptoms may require urgent review by a cardiologist. Chest pain and palpitations can indicate serious cardiac conditions. Please seek medical advice as soon as possible.",
    };
  }

  if (text.includes("rash") || text.includes("skin") || text.includes("itch") || text.includes("acne")) {
    return {
      recommendedSpecialty: "Dermatology",
      riskLevel: "medium",
      aiResponse:
        "Your symptoms may be related to a skin condition. A dermatologist is the most suitable specialist for evaluation and treatment of skin-related issues.",
    };
  }

  if (
    text.includes("headache") ||
    text.includes("numbness") ||
    text.includes("dizziness") ||
    text.includes("seizure") ||
    text.includes("memory")
  ) {
    return {
      recommendedSpecialty: "Neurology",
      riskLevel: "medium",
      aiResponse:
        "Your symptoms may require neurological evaluation. Persistent headaches, dizziness, or numbness can have various neurological causes that a specialist should assess.",
    };
  }

  if (
    text.includes("cough") ||
    text.includes("fever") ||
    text.includes("cold") ||
    text.includes("flu") ||
    text.includes("sore throat")
  ) {
    return {
      recommendedSpecialty: "General Medicine",
      riskLevel: "low",
      aiResponse:
        "Your symptoms are consistent with a common respiratory or general medical condition. A general physician can assess you and recommend appropriate treatment.",
    };
  }

  if (text.includes("stomach") || text.includes("abdomen") || text.includes("nausea") || text.includes("vomit")) {
    return {
      recommendedSpecialty: "Gastroenterology",
      riskLevel: "medium",
      aiResponse:
        "Your symptoms may be related to a gastrointestinal condition. A gastroenterologist can evaluate digestive issues and recommend appropriate tests or treatment.",
    };
  }

  if (text.includes("joint") || text.includes("bone") || text.includes("back pain") || text.includes("fracture")) {
    return {
      recommendedSpecialty: "Orthopaedics",
      riskLevel: "medium",
      aiResponse:
        "Your symptoms may relate to a musculoskeletal condition. An orthopaedic specialist can assess joint, bone, or back-related issues and suggest appropriate management.",
    };
  }

  if (text.includes("eye") || text.includes("vision") || text.includes("blur")) {
    return {
      recommendedSpecialty: "Ophthalmology",
      riskLevel: "medium",
      aiResponse:
        "Your symptoms may be related to an eye condition. An ophthalmologist can thoroughly evaluate your vision and eye health.",
    };
  }

  return {
    recommendedSpecialty: "General Medicine",
    riskLevel: "low",
    aiResponse:
      "Based on the provided symptoms, a general physician is recommended for an initial consultation and assessment.",
  };
};

// ─── Main Entry Point ─────────────────────────────────────────────────────────

const analyzeSymptoms = async (symptoms, age, gender, duration, additionalNotes) => {
  const provider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY;
  const isKeySet = apiKey && apiKey !== "your_ai_api_key_here";

  if (isKeySet && provider === "gemini") {
    try {
      const result = await analyzeWithGemini(symptoms, age, gender, duration, additionalNotes);
      return { ...result, sourceModel: process.env.AI_MODEL || "gemini-2.0-flash" };
    } catch (err) {
      console.error("Gemini AI failed, falling back to rule-based:", err.message);
    }
  }

  if (isKeySet && provider === "groq") {
    try {
      const result = await analyzeWithGroq(symptoms, age, gender, duration, additionalNotes);
      return { ...result, sourceModel: process.env.AI_MODEL || "llama-3.3-70b-versatile" };
    } catch (err) {
      console.error("Groq AI failed, falling back to rule-based:", err.message);
    }
  }

  return { ...analyzeWithRules(symptoms), sourceModel: "rule-based-v1" };
};

module.exports = { analyzeSymptoms };

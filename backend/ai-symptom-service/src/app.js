const express = require("express");
const cors = require("cors");
const aiSymptomRoutes = require("./routes/aiSymptomRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[AI-SYMPTOM-SERVICE] Incoming: ${req.method} ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "ai-symptom-service",
    message: "AI Symptom service is running"
  });
});

app.use("/api/ai-symptom", aiSymptomRoutes);

module.exports = app;
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "ai-symptom-service",
    message: "AI Symptom service is running"
  });
});

module.exports = app;
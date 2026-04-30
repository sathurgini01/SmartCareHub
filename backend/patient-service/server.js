require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const patientRoutes = require("./src/routes/patientRoutes");

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Patient DB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/patients", patientRoutes);

app.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error.message && error.message.includes('Only PDF, JPG, JPEG, and PNG files are allowed')) {
    return res.status(400).json({ error: error.message });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File is too large. Maximum allowed size is 5 MB.' });
  }

  console.error('Patient service error:', error);
  return res.status(500).json({ error: 'Server error.' });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "Patient Service is running" });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

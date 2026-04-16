require("dotenv").config();
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

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "Patient Service is running" });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
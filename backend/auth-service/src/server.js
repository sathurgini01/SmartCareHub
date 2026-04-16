// src/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set. Please check backend/auth-service/.env");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Auth DB Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
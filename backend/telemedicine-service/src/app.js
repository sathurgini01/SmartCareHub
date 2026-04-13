const express = require("express");
const cors = require("cors");
const telemedicineRoutes = require("./routes/telemedicineRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "telemedicine-service",
    message: "Telemedicine service is running"
  });
});

app.use("/api/telemedicine", telemedicineRoutes);

module.exports = app;
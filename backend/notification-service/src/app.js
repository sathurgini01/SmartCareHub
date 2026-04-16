const express = require("express");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "notification-service",
    message: "Notification service is running"
  });
});

app.use("/api/notifications", notificationRoutes);

module.exports = app;
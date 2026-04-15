require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI;

// Start HTTP server immediately — container stays alive regardless of DB
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});

// Connect MongoDB separately (non-blocking)
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection failed:", error.message));
} else {
  console.warn("MONGO_URI not set — running without database");
}

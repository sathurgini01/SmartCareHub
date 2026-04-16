const express = require("express");
const { register, login } = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Route (Any logged-in user)
router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    message: "User authenticated successfully",
    user: req.user
  });
});

// Role-based Example (Admin Only)
router.get("/admin-only", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    message: "Welcome Admin"
  });
});

module.exports = router;
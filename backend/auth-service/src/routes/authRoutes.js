const express = require("express");
const { register, login } = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// ── Public ──────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);

// ── Authenticated: current user ──────────────────────
router.get("/me", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Authenticated.",
    user: req.user,
  });
});

// ── Admin: list all users ────────────────────────────
router.get(
  "/admin/users",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users." });
    }
  }
);

// ── Admin: suspend a user ────────────────────────────
router.patch(
  "/admin/users/:id/suspend",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isSuspended: true },
        { new: true }
      ).select("-password");
      if (!user) return res.status(404).json({ message: "User not found." });
      res.json({ message: "User suspended.", user });
    } catch (err) {
      res.status(500).json({ message: "Failed to suspend user." });
    }
  }
);

// ── Admin: delete a user ─────────────────────────────
router.delete(
  "/admin/users/:id",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found." });
      res.json({ message: "User deleted." });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete user." });
    }
  }
);

module.exports = router;

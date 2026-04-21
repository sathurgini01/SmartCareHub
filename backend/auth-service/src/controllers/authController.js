const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

// Helper: basic email format check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Helper: password must be at least 8 chars, contain letter and number
const isStrongPassword = (password) =>
  password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const handleAuthError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);

  if (!isDatabaseReady()) {
    return res.status(503).json({
      message: "Authentication service is temporarily unavailable. Please try again in a moment.",
    });
  }

  if (error?.name === "ValidationError") {
    const firstValidationMessage = Object.values(error.errors || {})[0]?.message;
    return res.status(400).json({
      message: firstValidationMessage || "Submitted data is invalid.",
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      message: "An account with this email already exists.",
    });
  }

  if (
    error?.name === "MongooseError" &&
    typeof error?.message === "string" &&
    error.message.toLowerCase().includes("buffering timed out")
  ) {
    return res.status(503).json({
      message: "Database connection is not ready yet. Please try again in a moment.",
    });
  }

  return res.status(500).json({ message: fallbackMessage });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({
        message: "Authentication service is starting up. Please try again in a moment.",
      });
    }

    const { name, email, password, role, phone, address } = req.body;

    // Field presence
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    // Email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include at least one letter and one number.",
      });
    }

    // Duplicate check
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      role: role || "patient",
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return handleAuthError(res, error, "Registration failed. Please try again.");
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({
        message: "Authentication service is starting up. Please try again in a moment.",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.isSuspended) {
      return res
        .status(403)
        .json({ message: "Your account has been suspended. Contact support." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return handleAuthError(res, error, "Login failed. Please try again.");
  }
};

module.exports = { register, login };

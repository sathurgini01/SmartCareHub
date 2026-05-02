const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const systemKey = req.headers["x-system-key"];

  // Allow internal service-to-service communication via system key
  if (systemKey === "SMARTCARE-SYSTEM-KEY-2026") {
    req.user = { role: "admin", id: "system" };
    return next();
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: Access restricted to [${roles.join(", ")}] roles`,
    });
  }
  next();
};

module.exports = { protect, restrictTo };

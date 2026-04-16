// src/middleware/authMiddleware.js
// Dummy middleware for demonstration. Replace with real logic as needed.

function verifyToken(req, res, next) {
  // Example: Always allow
  next();
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    // Example: Always allow
    next();
  };
}

module.exports = { verifyToken, authorizeRoles };

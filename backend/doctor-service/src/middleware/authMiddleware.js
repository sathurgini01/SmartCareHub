const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const Doctor = require('../models/Doctor');

async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token missing');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    let resolvedId = decoded.id;

    // JWT id from centralized auth-service can differ from doctor-service profile id.
    // Resolve by email so existing role checks continue to work in doctor-service.
    if (decoded.role === 'doctor' && decoded.email) {
      const doctor = await Doctor.findOne({ email: decoded.email.toLowerCase() }).select('_id');
      if (doctor) {
        resolvedId = String(doctor._id);
      }
    }

    req.user = {
      id: resolvedId,
      authUserId: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    return next(error);
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: insufficient role privileges'));
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};

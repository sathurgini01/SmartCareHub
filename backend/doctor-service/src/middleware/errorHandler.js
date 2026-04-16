const ApiError = require('../utils/ApiError');

function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message,
    details: err.details || null
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};

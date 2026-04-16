const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

async function register(req, res, next) {
  try {
    const doctor = await authService.registerDoctor(req.body);
    return sendSuccess(res, 201, 'Doctor registered successfully', doctor);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginDoctor(req.body);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login
};
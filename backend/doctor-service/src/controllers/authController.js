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
    const result = await authService.loginUser(req.body, 'doctor');
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    return next(error);
  }
}

async function registerAdmin(req, res, next) {
  try {
    const admin = await authService.registerAdmin(req.body);
    return sendSuccess(res, 201, 'Admin registered successfully', admin);
  } catch (error) {
    return next(error);
  }
}

async function loginAdmin(req, res, next) {
  try {
    const result = await authService.loginUser(req.body, 'admin');
    return sendSuccess(res, 200, 'Admin login successful', result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  registerAdmin,
  loginAdmin
};

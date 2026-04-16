const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app = express();

// CORS - allow React frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Rate limiting
app.use(apiLimiter);

// Body parsing is intentionally skipped here so that http-proxy-middleware can proxy POST requests seamlessly.
// ============================================================
// Health Check
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'running',
    timestamp: new Date().toISOString(),
    services: {
      appointment: process.env.APPOINTMENT_SERVICE_URL,
      payment: process.env.PAYMENT_SERVICE_URL
    }
  });
});

// ============================================================
// Debug Logger - log every incoming request
// ============================================================
app.use((req, res, next) => {
  console.log(`[GATEWAY] Incoming: ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// ============================================================
// Proxy Routes - Forward to Microservices
// ============================================================

const appointmentProxy = require('./routes/appointmentProxy');
const paymentProxy = require('./routes/paymentProxy');

// Appointment Service Proxy
app.use('/api/appointments', appointmentProxy);

// Payment Service Proxy
app.use('/api/payments', paymentProxy);

// ============================================================
// Mock Auth Endpoint (for standalone testing)
// Will be replaced by Member 1's Authentication Service
// ============================================================
const jwt = require('jsonwebtoken');

// Parse JSON heavily for non-proxied routes (like /api/auth/login)
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  const { email, role = 'patient', name } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const token = jwt.sign(
    { 
      userId: `user_${Date.now()}`,
      role,
      name: name || email.split('@')[0],
      email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Login successful (mock)',
    data: {
      token,
      user: {
        userId: `user_${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        role
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /health',
      'POST /api/auth/login',
      '/api/appointments/*',
      '/api/payments/*'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on port ${PORT}`);
  console.log(`   Health:       http://localhost:${PORT}/health`);
  console.log(`   Auth (mock):  http://localhost:${PORT}/api/auth/login`);
  console.log(`   Appointments: http://localhost:${PORT}/api/appointments`);
  console.log(`   Payments:     http://localhost:${PORT}/api/payments`);
  console.log(`\n   Proxying to:`);
  console.log(`   → Appointment Service: ${process.env.APPOINTMENT_SERVICE_URL}`);
  console.log(`   → Payment Service:     ${process.env.PAYMENT_SERVICE_URL}\n`);
});

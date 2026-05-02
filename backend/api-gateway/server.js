const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app = express();

// CORS - allow React frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:80', 'http://localhost'],
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
      auth: process.env.AUTH_SERVICE_URL,
      patient: process.env.PATIENT_SERVICE_URL,
      doctor: process.env.DOCTOR_SERVICE_URL,
      appointment: process.env.APPOINTMENT_SERVICE_URL,
      payment: process.env.PAYMENT_SERVICE_URL,
      notification: process.env.NOTIFICATION_SERVICE_URL,
      telemedicine: process.env.TELEMEDICINE_SERVICE_URL,
      aiSymptom: process.env.AI_SYMPTOM_SERVICE_URL
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

const authProxy = require('./routes/authProxy');
const patientProxy = require('./routes/patientProxy');
const doctorProxy = require('./routes/doctorProxy');
const appointmentProxy = require('./routes/appointmentProxy');
const paymentProxy = require('./routes/paymentProxy');
const notificationProxy = require('./routes/notificationProxy');
const telemedicineProxy = require('./routes/telemedicineProxy');
const aiSymptomProxy = require('./routes/aiSymptomProxy');

// Auth Service Proxy
app.use('/api/auth', authProxy);

// Patient Service Proxy
app.use('/api/patients', patientProxy);

// Doctor Service Proxy
app.use('/api/doctors', doctorProxy);

// Appointment Service Proxy
app.use('/api/appointments', appointmentProxy);

// Payment Service Proxy
app.use('/api/payments', paymentProxy);

// Notification Service Proxy
app.use('/api/notifications', notificationProxy);

// Telemedicine Service Proxy
app.use('/api/telemedicine', telemedicineProxy);

// AI Symptom Service Proxy
app.use('/api/ai-symptom', aiSymptomProxy);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on port ${PORT}`);
  console.log(`   Health:       http://localhost:${PORT}/health`);
  console.log(`   Auth:         http://localhost:${PORT}/api/auth`);
  console.log(`   Patients:     http://localhost:${PORT}/api/patients`);
  console.log(`   Doctors:      http://localhost:${PORT}/api/doctors`);
  console.log(`   Appointments: http://localhost:${PORT}/api/appointments`);
  console.log(`   Payments:     http://localhost:${PORT}/api/payments`);
  console.log(`   Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`\n   Proxying to:`);
  console.log(`   → Auth Service:        ${process.env.AUTH_SERVICE_URL}`);
  console.log(`   → Patient Service:     ${process.env.PATIENT_SERVICE_URL}`);
  console.log(`   → Doctor Service:      ${process.env.DOCTOR_SERVICE_URL}`);
  console.log(`   → Appointment Service: ${process.env.APPOINTMENT_SERVICE_URL}`);
  console.log(`   → Payment Service:     ${process.env.PAYMENT_SERVICE_URL}`);
  console.log(`   → Telemedicine Service: ${process.env.TELEMEDICINE_SERVICE_URL}`);
  console.log(`   → AI Symptom Service:  ${process.env.AI_SYMPTOM_SERVICE_URL}\n`);
});

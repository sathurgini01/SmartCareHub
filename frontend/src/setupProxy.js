/**
 * Development proxy — used by react-scripts start only.
 * In Docker / Kubernetes, nginx handles these proxy rules instead.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const doctorServiceTarget = process.env.DOCTOR_SERVICE_URL || 'http://127.0.0.1:5010';
  const appointmentServiceTarget = process.env.APPOINTMENT_SERVICE_URL || 'http://127.0.0.1:5003';

  app.use(
    createProxyMiddleware('/api/auth', {
      target: 'http://localhost:5001',
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/patients', {
      target: 'http://localhost:5002',
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/doctors', {
      target: doctorServiceTarget,
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/availability', {
      target: doctorServiceTarget,
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/prescriptions', {
      target: doctorServiceTarget,
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/admin', {
      target: doctorServiceTarget,
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/doctor-appointments', {
      target: doctorServiceTarget,
      changeOrigin: true,
      pathRewrite: {
        '^/api/doctor-appointments': '/api/appointments',
      },
    })
  );

  app.use(
    createProxyMiddleware('/api/doctor-auth', {
      target: doctorServiceTarget,
      changeOrigin: true,
      pathRewrite: {
        '^/api/doctor-auth': '/api/auth',
      },
    })
  );

  app.use(
    createProxyMiddleware('/api/appointments', {
      target: appointmentServiceTarget,
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/payments', {
      target: 'http://localhost:5011',
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/telemedicine', {
      target: 'http://localhost:5004',
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/notifications', {
      target: 'http://localhost:5005',
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/ai-symptom', {
      target: 'http://localhost:5006',
      changeOrigin: true,
    })
  );
};

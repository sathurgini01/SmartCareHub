/**
 * Development proxy — used by react-scripts start only.
 * In Docker / Kubernetes, nginx handles these proxy rules instead.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
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
      target: 'http://localhost:5010',
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/availability', {
      target: 'http://localhost:5010',
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/prescriptions', {
      target: 'http://localhost:5010',
      changeOrigin: true,
    })
  );

  app.use(
    createProxyMiddleware('/api/appointments', {
      target: 'http://localhost:5003',
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

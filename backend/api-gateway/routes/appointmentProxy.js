const { createProxyMiddleware } = require('http-proxy-middleware');

const appointmentProxy = createProxyMiddleware({
  target: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY] → Appointment Service: ${req.method} ${req.path}`);
    },
    error: (err, req, res) => {
      console.error('[GATEWAY] Appointment Service error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Appointment Service is unavailable' 
      });
    }
  }
});

module.exports = appointmentProxy;

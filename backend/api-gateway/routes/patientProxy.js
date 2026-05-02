const { createProxyMiddleware } = require('http-proxy-middleware');

const patientProxy = createProxyMiddleware({
  target: process.env.PATIENT_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY] → Patient Service: ${req.method} ${req.path}`);
    },
    error: (err, req, res) => {
      console.error('[GATEWAY] Patient Service error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Patient Service is unavailable' 
      });
    }
  }
});

module.exports = patientProxy;

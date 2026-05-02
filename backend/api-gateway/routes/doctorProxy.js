const { createProxyMiddleware } = require('http-proxy-middleware');

const doctorProxy = createProxyMiddleware({
  target: process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY] → Doctor Service: ${req.method} ${req.path}`);
    },
    error: (err, req, res) => {
      console.error('[GATEWAY] Doctor Service error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Doctor Service is unavailable' 
      });
    }
  }
});

module.exports = doctorProxy;

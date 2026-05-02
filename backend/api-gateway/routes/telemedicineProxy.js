const { createProxyMiddleware } = require('http-proxy-middleware');

const telemedicineProxy = createProxyMiddleware({
  target: process.env.TELEMEDICINE_SERVICE_URL || 'http://telemedicine-service:5004',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY] → Telemedicine Service: ${req.method} ${req.path}`);
    },
    error: (err, req, res) => {
      console.error('[GATEWAY] Telemedicine Service error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Telemedicine Service is unavailable' 
      });
    }
  }
});

module.exports = telemedicineProxy;

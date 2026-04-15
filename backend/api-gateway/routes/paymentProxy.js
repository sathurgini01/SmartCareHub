const { createProxyMiddleware } = require('http-proxy-middleware');

const paymentProxy = createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY] → Payment Service: ${req.method} ${req.path}`);
    },
    error: (err, req, res) => {
      console.error('[GATEWAY] Payment Service error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Payment Service is unavailable' 
      });
    }
  }
});

module.exports = paymentProxy;

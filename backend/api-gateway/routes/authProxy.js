const { createProxyMiddleware } = require('http-proxy-middleware');

const authProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY] → Auth Service: ${req.method} ${req.path}`);
    },
    error: (err, req, res) => {
      console.error('[GATEWAY] Auth Service error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Auth Service is unavailable' 
      });
    }
  }
});

module.exports = authProxy;

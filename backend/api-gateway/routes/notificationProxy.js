const { createProxyMiddleware } = require('http-proxy-middleware');

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5005';

const notificationProxy = createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY] → Notification Service: ${req.method} ${req.originalUrl}`);
    },
    error: (err, req, res) => {
      console.error('[GATEWAY] Notification Service error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'Notification Service is unavailable' 
      });
    }
  }
});

module.exports = notificationProxy;

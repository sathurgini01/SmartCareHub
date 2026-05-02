const { createProxyMiddleware } = require('http-proxy-middleware');

const aiSymptomProxy = createProxyMiddleware({
  target: process.env.AI_SYMPTOM_SERVICE_URL || 'http://ai-symptom-service:5006',
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log(`[GATEWAY] → AI Symptom Service: ${req.method} ${req.path}`);
    },
    error: (err, req, res) => {
      console.error('[GATEWAY] AI Symptom Service error:', err.message);
      res.status(503).json({ 
        success: false, 
        message: 'AI Symptom Service is unavailable' 
      });
    }
  }
});

module.exports = aiSymptomProxy;

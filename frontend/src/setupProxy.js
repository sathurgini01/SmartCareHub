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
};

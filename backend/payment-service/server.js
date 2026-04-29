const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'payment-service', 
    status: 'running', 
    timestamp: new Date().toISOString(),
    payhere: {
      sandbox: process.env.PAYHERE_SANDBOX === 'true',
      merchantId: process.env.PAYHERE_MERCHANT_ID ? '***configured***' : 'not configured'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5011;

// Start HTTP server immediately so the port is bound right away
app.listen(PORT, () => {
  console.log(`💳 Payment Service running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API:    http://localhost:${PORT}/api/payments`);
  console.log(`   PayHere: ${process.env.PAYHERE_SANDBOX === 'true' ? 'SANDBOX' : 'PRODUCTION'} mode`);
});

// Connect to DB after server starts (non-blocking)
connectDB().catch((err) => {
  console.error('Initial DB connect failed, will retry automatically:', err.message);
});

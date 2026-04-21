const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const appointmentRoutes = require('./routes/appointmentRoutes');
const seedDoctors = require('./seed/seedDoctors');
const { syncDoctorDirectory } = require('./services/doctorDirectorySync');

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
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'appointment-service', 
    status: 'running', 
    timestamp: new Date().toISOString() 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  await seedDoctors();
  await syncDoctorDirectory(true).catch((error) => {
    console.error('Doctor directory sync failed during startup:', error.message);
  });
  
  app.listen(PORT, () => {
    console.log(`🏥 Appointment Service running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API:    http://localhost:${PORT}/api/appointments`);
  });
};

startServer();

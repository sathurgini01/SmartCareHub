const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Appointment DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    return;
  }

  const tryConnect = async (attempt = 1) => {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`✅ Payment DB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ DB Connection Error (attempt ${attempt}): ${error.message}`);
      console.log(`⏳ Retrying in 5 seconds...`);
      setTimeout(() => tryConnect(attempt + 1), 5000);
    }
  };

  await tryConnect();
};

module.exports = connectDB;

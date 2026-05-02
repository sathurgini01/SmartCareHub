const Doctor = require('../models/Doctor');

const mockDoctors = []; // Empty mock data to maintain Option A

const seedDoctors = async () => {
  try {
    // 1. Delete any doctors that were NOT synced from the doctor-service (Mock doctors)
    // Real doctors have 'source: doctor-service'
    const deleteResult = await Doctor.deleteMany({ 
      source: { $ne: 'doctor-service' } 
    });

    if (deleteResult.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deleteResult.deletedCount} mock doctors from the database.`);
    }

    // 2. Ensure we don't add new ones
    console.log('ℹ️  Mock seeding is disabled. Only real, approved doctors will be shown.');
    
  } catch (error) {
    console.error('❌ Cleanup/Seed error:', error.message);
  }
};

module.exports = seedDoctors;

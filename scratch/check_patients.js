const mongoose = require('mongoose');
const Patient = require('./backend/patient-service/src/models/Patient');
require('dotenv').config({ path: './backend/patient-service/.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcare_patient');
    const patients = await Patient.find();
    console.log('Total patients:', patients.length);
    patients.forEach(p => {
      console.log(`Patient: ${p.fullName}, Prescriptions: ${p.prescriptions.length}`);
      if (p.prescriptions.length > 0) {
        console.log('Sample prescription:', p.prescriptions[0]);
      }
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();

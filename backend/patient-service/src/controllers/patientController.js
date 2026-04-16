const Patient = require('../models/Patient');

// Create patient profile
exports.createProfile = async (req, res) => {
  try {
    const { fullName, email, phone, dateOfBirth, gender, address, medicalHistory } = req.body;

    // Check if profile already exists
    const existingProfile = await Patient.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    const patient = new Patient({
      userId: req.user.id,
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      medicalHistory
    });

    await patient.save();
    res.status(201).json({ message: 'Profile created successfully', patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'address', 'medicalHistory'];
    const updates = Object.keys(req.body);

    // Check for invalid updates
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid update field' });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    updates.forEach(update => patient[update] = req.body[update]);
    await patient.save();

    res.json({ message: 'Profile updated successfully', patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete current user's profile
exports.deleteProfile = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload medical report
exports.uploadReport = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const report = {
      fileName: req.file.originalname,
      filePath: req.file.path
    };

    patient.reports.push(report);
    await patient.save();

    res.json({ message: 'Report uploaded successfully', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all patients (Admin only)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select('-reports.filePath');
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Suspend patient (Admin only)
exports.suspendPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    patient.isSuspended = true;
    await patient.save();

    res.json({ message: 'Patient suspended successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
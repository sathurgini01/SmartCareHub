const Patient = require('../models/Patient');
const DOCTOR_SERVICE_URL = (process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002').replace(/\/$/, '');

// ── Patient: Create profile ──────────────────────────────────────────────────
exports.createProfile = async (req, res) => {
  try {
    const { fullName, email, phone, dateOfBirth, gender, address, medicalHistory } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required.' });
    }

    const existing = await Patient.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ error: 'Profile already exists.' });
    }

    const patient = new Patient({
      userId: req.user.id,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      dateOfBirth,
      gender,
      address: address?.trim() || '',
      medicalHistory: medicalHistory?.trim() || '',
    });

    await patient.save();
    res.status(201).json({ message: 'Profile created successfully.', patient });
  } catch (error) {
    console.error('createProfile error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Get own profile ─────────────────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json(patient);
  } catch (error) {
    console.error('getMyProfile error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Update own profile ──────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    // Support both 'name' (from frontend) and 'fullName' (canonical)
    if (req.body.name && !req.body.fullName) {
      req.body.fullName = req.body.name;
    }
    delete req.body.name;

    const allowedUpdates = [
      'fullName', 'email', 'phone', 'dateOfBirth',
      'gender', 'address', 'medicalHistory',
    ];
    const updates = Object.keys(req.body).filter((k) => allowedUpdates.includes(k));

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    updates.forEach((key) => {
      patient[key] = req.body[key];
    });
    await patient.save();

    res.json({ message: 'Profile updated successfully.', patient });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Delete own account ──────────────────────────────────────────────
exports.deleteProfile = async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('deleteProfile error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Upload medical report ──────────────────────────────────────────
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const report = {
      fileName: req.file.originalname,
      filePath: req.file.path,
      description: req.body.description?.trim() || '',
    };

    patient.reports.push(report);
    await patient.save();

    res.json({ message: 'Report uploaded successfully.', report });
  } catch (error) {
    console.error('uploadReport error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Get own reports ─────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json(patient.reports || []);
  } catch (error) {
    console.error('getReports error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Get prescriptions (placeholder — populated by Doctor Service) ──
exports.getPrescriptions = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const response = await fetch(`${DOCTOR_SERVICE_URL}/api/prescriptions/patient/me`, {
      headers: {
        Authorization: authHeader
      }
    });

    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(payload);
    }

    res.json(payload.data || []);
  } catch (error) {
    console.error('getPrescriptions error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Get appointments (placeholder — populated by Appointment Service) ─
exports.getAppointments = async (req, res) => {
  try {
    // Appointments are managed by the Appointment Service.
    // This endpoint acts as a proxy stub until inter-service communication is wired.
    res.json([]);
  } catch (error) {
    console.error('getAppointments error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Get medical history ─────────────────────────────────────────────
exports.getMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).select(
      'fullName medicalHistory reports prescriptions'
    );
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({
      fullName: patient.fullName,
      medicalHistory: patient.medicalHistory,
      reports: patient.reports,
      prescriptions: patient.prescriptions,
    });
  } catch (error) {
    console.error('getMedicalHistory error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Admin: Get all patients ───────────────────────────────────────────────────
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select('-reports.filePath');
    res.json(patients);
  } catch (error) {
    console.error('getAllPatients error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Admin: Suspend patient ────────────────────────────────────────────────────
exports.suspendPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }
    patient.isSuspended = true;
    await patient.save();
    res.json({ message: 'Patient suspended successfully.' });
  } catch (error) {
    console.error('suspendPatient error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Admin: Delete patient ─────────────────────────────────────────────────────
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }
    res.json({ message: 'Patient deleted successfully.' });
  } catch (error) {
    console.error('deletePatient error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

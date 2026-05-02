const path = require('path');
const Patient = require('../models/Patient');
const DOCTOR_SERVICE_URL = (process.env.DOCTOR_SERVICE_URL || 'http://localhost:5002').replace(/\/$/, '');

async function ensurePatientProfile(user) {
  let patient = await Patient.findOne({ userId: user.id });
  if (patient) {
    return patient;
  }

  patient = new Patient({
    userId: user.id,
    fullName: user.name || user.fullName || user.email?.split('@')[0] || 'Patient',
    email: String(user.email || '').toLowerCase().trim(),
    phone: '',
    address: '',
    medicalHistory: ''
  });

  await patient.save();
  return patient;
}

function normalizeReport(patient, report) {
  return {
    _id: report._id,
    fileName: report.fileName,
    description: report.description || '',
    uploadedAt: report.uploadedAt,
    patientUserId: report.patientUserId || patient.userId,
    patientName: report.patientName || patient.fullName,
    doctorId: report.doctorId || '',
    doctorName: report.doctorName || '',
    doctorEmail: report.doctorEmail || '',
    fileType: report.fileType || path.extname(report.fileName || '').replace('.', '').toUpperCase(),
    downloadPath: `/api/patients/reports/${report._id}/download`
  };
}

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
    const patient = await ensurePatientProfile(req.user);
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

    const doctorId = String(req.body.doctorId || '').trim();
    const doctorName = String(req.body.doctorName || '').trim();
    const doctorEmail = String(req.body.doctorEmail || '').trim().toLowerCase();

    if (!doctorId || !doctorName || !doctorEmail) {
      return res.status(400).json({ error: 'Please select an active doctor before uploading.' });
    }

    const report = {
      fileName: req.file.originalname,
      filePath: req.file.path,
      description: req.body.description?.trim() || '',
      patientUserId: patient.userId,
      patientName: patient.fullName,
      doctorId,
      doctorName,
      doctorEmail,
      fileType: path.extname(req.file.originalname || '').replace('.', '').toUpperCase(),
    };

    patient.reports.push(report);
    await patient.save();
    const savedReport = patient.reports[patient.reports.length - 1];

    res.json({
      message: 'Report uploaded successfully.',
      report: normalizeReport(patient, savedReport)
    });
  } catch (error) {
    console.error('uploadReport error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// ── Patient: Get own reports ─────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  try {
    const patient = await ensurePatientProfile(req.user);
    res.json((patient.reports || []).map((report) => normalizeReport(patient, report)));
  } catch (error) {
    console.error('getReports error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getAssignedDoctorReports = async (req, res) => {
  try {
    const doctorEmail = String(req.user.email || '').trim().toLowerCase();
    if (!doctorEmail) {
      return res.status(400).json({ error: 'Doctor email is missing from the authenticated session.' });
    }

    const patients = await Patient.find({ 'reports.doctorEmail': doctorEmail }).select('fullName userId reports');
    const reports = patients.flatMap((patient) =>
      (patient.reports || [])
        .filter((report) => String(report.doctorEmail || '').trim().toLowerCase() === doctorEmail)
        .map((report) => normalizeReport(patient, report))
    );

    reports.sort((first, second) => new Date(second.uploadedAt) - new Date(first.uploadedAt));
    res.json(reports);
  } catch (error) {
    console.error('getAssignedDoctorReports error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const role = req.user?.role;
    const doctorEmail = String(req.user?.email || '').trim().toLowerCase();

    const patientQuery =
      role === 'patient'
        ? { userId: req.user.id, 'reports._id': reportId }
        : role === 'doctor'
          ? { 'reports._id': reportId, 'reports.doctorEmail': doctorEmail }
          : { 'reports._id': reportId };

    const patient = await Patient.findOne(patientQuery);
    if (!patient) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const report = patient.reports.id(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    return res.download(report.filePath, report.fileName);
  } catch (error) {
    console.error('downloadReport error:', error);
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

exports.getPatientPrescriptionsForAdmin = async (req, res) => {
  try {
    const { patientId } = req.params;
    const authHeader = req.headers.authorization || '';
    
    const response = await fetch(`${DOCTOR_SERVICE_URL}/api/prescriptions/patient/${patientId}`, {
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
    console.error('getPatientPrescriptionsForAdmin error:', error);
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
// ── Admin: Update patient ─────────────────────────────────────────────────────
exports.adminUpdatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    // Support both 'name' and 'fullName'
    if (req.body.name && !req.body.fullName) {
      req.body.fullName = req.body.name;
    }

    const allowedUpdates = [
      'fullName', 'email', 'phone', 'dateOfBirth',
      'gender', 'address', 'medicalHistory', 'isSuspended'
    ];
    
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        patient[key] = req.body[key];
      }
    });

    await patient.save();
    res.json({ message: 'Patient updated successfully.', patient });
  } catch (error) {
    console.error('adminUpdatePatient error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

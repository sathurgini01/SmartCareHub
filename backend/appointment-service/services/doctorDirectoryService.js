const Doctor = require('../models/Doctor');

const DOCTOR_SERVICE_BASE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5010/api';

function normalizeSpecialty(value) {
  const allowed = new Set([
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Gynecology',
    'Ophthalmology',
    'ENT',
    'Psychiatry',
    'Dental'
  ]);

  return allowed.has(value) ? value : 'General Medicine';
}

async function fetchJson(url) {
  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || `Request failed for ${url}`);
  }

  return payload.data;
}

function toLocalAvailability(slot) {
  if (!slot?.day || !slot?.startTime || !slot?.endTime) {
    return null;
  }

  return {
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
    slotDuration: 30
  };
}

async function upsertDoctor(remoteDoctor) {
  const existing = await Doctor.findOne({
    $or: [
      { externalDoctorId: remoteDoctor._id },
      { email: remoteDoctor.email.toLowerCase() }
    ]
  });

  const availability = Array.isArray(remoteDoctor.availability)
    ? remoteDoctor.availability.map(toLocalAvailability).filter(Boolean)
    : [];

  const payload = {
    externalDoctorId: remoteDoctor._id,
    name: remoteDoctor.name,
    email: remoteDoctor.email.toLowerCase(),
    specialty: normalizeSpecialty(remoteDoctor.specialization),
    licenseNumber: remoteDoctor.licenseNumber || '',
    qualifications: remoteDoctor.licenseNumber ? [remoteDoctor.licenseNumber] : [],
    experience: Number(remoteDoctor.experience) || 0,
    consultationFee: Number(remoteDoctor.consultationFee) || 2500,
    currency: remoteDoctor.currency || 'LKR',
    avatar: remoteDoctor.profileImage || null,
    rating: Number(remoteDoctor.rating) || 4,
    totalReviews: Number(remoteDoctor.totalReviews) || 0,
    availability,
    hospital: remoteDoctor.hospital || '',
    phone: remoteDoctor.phone || '',
    bio: remoteDoctor.bio || '',
    title: remoteDoctor.title || '',
    status: remoteDoctor.status || 'approved',
    role: remoteDoctor.role || 'doctor',
    isAvailable: remoteDoctor.status !== 'rejected',
    source: 'doctor-service'
  };

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return Doctor.create(payload);
}

async function syncDoctorDirectory() {
  const remoteDoctors = await fetchJson(`${DOCTOR_SERVICE_BASE_URL}/doctors/public`);
  const synced = [];

  for (const remoteDoctor of remoteDoctors) {
    const doctor = await upsertDoctor(remoteDoctor);
    synced.push(doctor);
  }

  return synced;
}

async function syncDoctorByReference(reference) {
  if (!reference) {
    return null;
  }

  const byExternal = await Doctor.findOne({ externalDoctorId: reference });
  if (byExternal) {
    return byExternal;
  }

  const byId = await Doctor.findById(reference).catch(() => null);
  if (byId) {
    return byId;
  }

  const remoteDoctor = await fetchJson(`${DOCTOR_SERVICE_BASE_URL}/doctors/public/${reference}`);
  return upsertDoctor(remoteDoctor);
}

async function syncDoctorByEmail(email) {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.toLowerCase();
  let doctor = await Doctor.findOne({ email: normalizedEmail });

  if (doctor) {
    return doctor;
  }

  await syncDoctorDirectory();
  doctor = await Doctor.findOne({ email: normalizedEmail });
  return doctor;
}

module.exports = {
  syncDoctorDirectory,
  syncDoctorByReference,
  syncDoctorByEmail
};

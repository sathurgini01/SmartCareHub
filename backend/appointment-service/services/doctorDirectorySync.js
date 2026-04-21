const Doctor = require('../models/Doctor');

const DOCTOR_SERVICE_URL = (process.env.DOCTOR_SERVICE_URL || 'http://localhost:5010').replace(/\/$/, '');
const DEFAULT_SLOT_DURATION = 30;
const DEFAULT_FEE = 2500;
const SYNC_INTERVAL_MS = 15000;

let lastSyncAt = 0;
let lastSyncAttemptAt = 0;
let syncInFlight = null;

function defaultAvailability() {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => ({
    day,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: DEFAULT_SLOT_DURATION
  }));
}

function isoToTimeString(value) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function groupAvailability(slots = []) {
  if (!Array.isArray(slots) || slots.length === 0) {
    return defaultAvailability();
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const byDay = new Map();

  for (const slot of slots) {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      continue;
    }

    const day = dayNames[start.getDay()];
    const next = {
      day,
      startTime: isoToTimeString(start),
      endTime: isoToTimeString(end),
      slotDuration: DEFAULT_SLOT_DURATION
    };
    const current = byDay.get(day);

    if (!current) {
      byDay.set(day, next);
      continue;
    }

    if (next.startTime < current.startTime) current.startTime = next.startTime;
    if (next.endTime > current.endTime) current.endTime = next.endTime;
  }

  return byDay.size > 0 ? Array.from(byDay.values()) : defaultAvailability();
}

function mapDoctorPayload(doctor) {
  return {
    externalDoctorId: String(doctor._id),
    name: doctor.name,
    email: doctor.email,
    specialty: doctor.specialization || 'General Medicine',
    qualifications: doctor.qualifications || ['MBBS'],
    experience: Number(doctor.experience || 0),
    consultationFee: Number(doctor.consultationFee || DEFAULT_FEE),
    currency: doctor.currency || 'LKR',
    avatar: doctor.profileImage || null,
    rating: Number(doctor.rating || 4.5),
    totalReviews: Number(doctor.totalReviews || 0),
    availability: groupAvailability(doctor.availability),
    hospital: doctor.hospital || 'SmartCareHub',
    bio: doctor.bio || `${doctor.specialization || 'General Medicine'} specialist`,
    isAvailable: doctor.status === 'approved',
    source: 'doctor-service'
  };
}

async function fetchApprovedDoctors() {
  const url = `${DOCTOR_SERVICE_URL}/api/doctors/public`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Doctor service sync failed with status ${response.status} at ${url}`);
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

async function doSync() {
  lastSyncAttemptAt = Date.now();
  const approvedDoctors = await fetchApprovedDoctors();

  for (const doctor of approvedDoctors) {
    const update = mapDoctorPayload(doctor);
    await Doctor.findOneAndUpdate(
      {
        $or: [
          { externalDoctorId: update.externalDoctorId },
          { email: update.email }
        ]
      },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  lastSyncAt = Date.now();
}

async function syncDoctorDirectory(force = false) {
  const lastRunAt = Math.max(lastSyncAt, lastSyncAttemptAt);
  const freshEnough = !force && Date.now() - lastRunAt < SYNC_INTERVAL_MS;
  if (freshEnough) {
    return;
  }

  if (!syncInFlight) {
    syncInFlight = doSync().finally(() => {
      syncInFlight = null;
    });
  }

  await syncInFlight;
}

module.exports = {
  syncDoctorDirectory
};

import { apiRequest } from '../api';
import api from './api';
import { getAccessToken, getSession, wait } from './storage';

let cachedDoctorId = '';
let cachedToken = '';

function getAuth() {
  const session = getSession();
  const token = getAccessToken();
  return { session, token };
}

async function resolveDoctorId(token) {
  if (!token) {
    throw new Error('Authentication token missing');
  }

  if (cachedDoctorId && cachedToken === token) {
    return cachedDoctorId;
  }

  const profile = await apiRequest('/doctors/me', { token });
  const doctorId = profile?.data?._id || profile?.data?.id;

  if (!doctorId) {
    throw new Error('Unable to resolve doctor profile');
  }

  cachedDoctorId = doctorId;
  cachedToken = token;
  return doctorId;
}

function mapDoctor(user) {
  return {
    id: user._id || user.id,
    fullName: user.name || user.fullName || '',
    email: user.email || '',
    specialization: user.specialization || '',
    licenseNumber: user.licenseNumber || '',
    experience: user.experience ?? '',
    hospital: user.hospital || '',
    phone: user.phone || '',
    bio: user.bio || '',
    profileImage: user.profileImage || '',
    status: user.status || '',
    role: user.role || 'doctor',
    submittedDate: user.createdAt || user.submittedDate || ''
  };
}

function toIsoRange(slot) {
  const startTime = `${slot.date}T${slot.startTime}:00`;
  const endTime = `${slot.date}T${slot.endTime}:00`;
  return { startTime, endTime };
}

function mapAvailability(slot) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  const date = start.toISOString().slice(0, 10);
  const startTime = start.toISOString().slice(11, 16);
  const endTime = end.toISOString().slice(11, 16);

  return {
    id: slot._id || slot.id,
    doctorId: slot.doctorId?._id || slot.doctorId,
    date,
    startTime,
    endTime,
    consultationType: slot.consultationType || 'Online',
    location: slot.location || 'Online',
    status: slot.status || 'Open'
  };
}

function mapAppointment(item) {
  return {
    id: item._id || item.id,
    doctorId: item.doctorId?._id || item.doctorId,
    patientId: item.patientId || '',
    patientName: item.patientName || '',
    appointmentDate: item.appointmentDate || (item.scheduledAt || '').slice(0, 10),
    time: item.time || (item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(11, 16) : ''),
    reason: item.reason || '',
    consultationType: item.consultationType || item.mode || 'Online',
    status: item.status || 'pending'
  };
}

function mapPrescription(item) {
  return {
    id: item._id || item.id,
    patientId: item.patientId || '',
    patientName: item.patientName || '',
    doctorId: item.doctorId?._id || item.doctorId,
    date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
    diagnosis: item.diagnosis || '',
    medicines: Array.isArray(item.medicines) ? item.medicines : [],
    notes: item.notes || '',
    followUpDate: item.followUpDate ? new Date(item.followUpDate).toISOString().slice(0, 10) : ''
  };
}

export async function getDoctorDashboard(_doctorId) {
  const { token } = getAuth();
  const doctorId = await resolveDoctorId(token);
  const [doctorResponse, availabilityResponse, appointmentsResponse, prescriptionsResponse] = await Promise.all([
    apiRequest(`/doctors/${doctorId}`, { token }),
    apiRequest(`/availability/${doctorId}`, { token }),
    apiRequest(`/appointments/doctor/${doctorId}`, { token }),
    apiRequest(`/prescriptions/${doctorId}`, { token })
  ]);

  return {
    doctor: mapDoctor(doctorResponse.data),
    availability: availabilityResponse.data.map(mapAvailability),
    appointments: appointmentsResponse.data.map(mapAppointment),
    prescriptions: prescriptionsResponse.data.map(mapPrescription),
    reports: [],
    telemedicineSessions: []
  };
}

export async function updateDoctorProfile(_doctorId, updates) {
  const { token } = getAuth();
  const doctorId = await resolveDoctorId(token);
  const response = await apiRequest(`/doctors/${doctorId}`, {
    method: 'PUT',
    token,
    body: {
      fullName: updates.fullName,
      email: updates.email,
      specialization: updates.specialization,
      licenseNumber: updates.licenseNumber,
      experience: updates.experience,
      hospital: updates.hospital,
      phone: updates.phone,
      bio: updates.bio,
      profileImage: updates.profileImage
    }
  });

  return mapDoctor(response.data);
}

export async function deleteDoctorProfile(_doctorId) {
  const { token } = getAuth();
  const doctorId = await resolveDoctorId(token);
  await apiRequest(`/doctors/${doctorId}`, {
    method: 'DELETE',
    token
  });
  return true;
}

export async function saveAvailability(_doctorId, slot, editingId = null) {
  const { token } = getAuth();
  const doctorId = await resolveDoctorId(token);
  const { startTime, endTime } = toIsoRange(slot);
  const path = editingId ? `/availability/${editingId}` : '/availability';
  const method = editingId ? 'PUT' : 'POST';

  await apiRequest(path, {
    method,
    token,
    body: {
      doctorId,
      startTime,
      endTime,
      consultationType: slot.consultationType,
      location: slot.location,
      status: slot.status || 'Open'
    }
  });

  return true;
}

export async function deleteAvailability(slotId) {
  const { token } = getAuth();
  await apiRequest(`/availability/${slotId}`, {
    method: 'DELETE',
    token
  });
  return true;
}

export async function updateAppointmentStatus(appointmentId, status) {
  const { token } = getAuth();
  await apiRequest(`/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    token,
    body: { status }
  });
  return true;
}

export async function rescheduleAppointment(appointmentId, appointmentDate, time) {
  const { token } = getAuth();
  await apiRequest(`/appointments/${appointmentId}/reschedule`, {
    method: 'PATCH',
    token,
    body: { appointmentDate, time }
  });
  return true;
}

export async function savePrescription(_doctorId, payload, editingId = null) {
  const { token } = getAuth();
  const doctorId = await resolveDoctorId(token);
  const path = editingId ? `/prescriptions/${editingId}` : '/prescriptions';
  const method = editingId ? 'PUT' : 'POST';

  await apiRequest(path, {
    method,
    token,
    body: {
      patientId: payload.patientId,
      patientName: payload.patientName,
      doctorId,
      date: payload.date,
      diagnosis: payload.diagnosis,
      medicines: payload.medicines,
      notes: payload.notes,
      followUpDate: payload.followUpDate || null
    }
  });

  return true;
}

export async function deletePrescription(prescriptionId) {
  const { token } = getAuth();
  await apiRequest(`/prescriptions/${prescriptionId}`, {
    method: 'DELETE',
    token
  });
  return true;
}

export async function saveTelemedicineSession() {
  return wait(true);
}

// ── Service Object (New Features) ──────────────────────────────────────────
export const doctorService = {
  // Get all doctors with optional filters
  getAll: (params = {}) => api.get('/appointments/doctors', { params }),
  
  // Get single doctor
  getById: (id) => api.get(`/appointments/doctors/${id}`),
  
  // Get available time slots for a doctor on a date
  getAvailability: (id, date) => api.get(`/appointments/doctors/${id}/availability`, { params: { date } }),
  
  // Get all specialties with counts
  getSpecialties: () => api.get('/appointments/specialties')
};

export default doctorService;

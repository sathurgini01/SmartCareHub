import { apiRequest } from '../api';
import { getSession } from './storage';

function getToken() {
  return getSession()?.token || '';
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
    submittedDate: user.createdAt || user.submittedDate || '',
    title: user.title || '',
    accessKey: user.accessKey || ''
  };
}

export async function getAdminDashboard() {
  const response = await apiRequest('/admin/doctors', { token: getToken() });
  return {
    doctors: response.data.map(mapDoctor),
    telemedicineSessions: []
  };
}

export async function updateDoctorVerification(doctorId, status) {
  const path = status === 'approved' ? `/admin/doctors/approve/${doctorId}` : `/admin/doctors/reject/${doctorId}`;
  await apiRequest(path, {
    method: 'PUT',
    token: getToken()
  });
  return true;
}

export async function deleteDoctorAccount(doctorId) {
  await apiRequest(`/doctors/${doctorId}`, {
    method: 'DELETE',
    token: getToken()
  });
  return true;
}

export async function updateDoctorAccount(doctorId, updates) {
  const response = await apiRequest(`/doctors/${doctorId}`, {
    method: 'PUT',
    token: getToken(),
    body: updates
  });
  return mapDoctor(response.data);
}

export async function getAdminProfile(adminId) {
  const response = await apiRequest(`/doctors/${adminId}`, {
    token: getToken()
  });
  return mapDoctor(response.data);
}

export async function updateAdminProfile(adminId, updates) {
  const response = await apiRequest(`/doctors/${adminId}`, {
    method: 'PUT',
    token: getToken(),
    body: {
      fullName: updates.fullName,
      email: updates.email,
      title: updates.title,
      accessKey: updates.accessKey
    }
  });
  return mapDoctor(response.data);
}

export async function deleteAdminProfile(adminId) {
  await apiRequest(`/doctors/${adminId}`, {
    method: 'DELETE',
    token: getToken()
  });
  return true;
}

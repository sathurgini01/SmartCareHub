import { apiRequest } from '../api';
import { clearSession, getSession, setSession, wait } from './storage';

function mapUser(user) {
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

export async function bootstrapSession() {
  const savedSession = getSession();

  if (!savedSession) {
    return wait(null);
  }

  const hasValidSession =
    Boolean(savedSession.token) &&
    Boolean(savedSession.role) &&
    Boolean(savedSession.user?.id || savedSession.user?._id);

  if (!hasValidSession) {
    clearSession();
    return wait(null);
  }

  return wait({
    ...savedSession,
    user: mapUser(savedSession.user)
  });
}

export async function login({ email, password, role }) {
  const path = role === 'admin' ? '/doctors/admin/login' : '/doctors/login';
  const response = await apiRequest(path, {
    method: 'POST',
    body: { email, password }
  });

  const session = {
    token: response.data.token,
    user: mapUser(response.data.doctor),
    role
  };

  setSession(session);
  return session;
}

export async function registerDoctor(payload) {
  const response = await apiRequest('/doctors/register', {
    method: 'POST',
    body: {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
      specialization: payload.specialization,
      licenseNumber: payload.licenseNumber,
      experience: payload.experience,
      hospital: payload.hospital,
      profileImage: payload.profileImage
    }
  });

  return mapUser(response.data);
}

export async function registerAdmin(payload) {
  const response = await apiRequest('/doctors/admin/register', {
    method: 'POST',
    body: {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
      accessKey: payload.accessKey
    }
  });

  return mapUser(response.data);
}

export async function logout() {
  clearSession();
  return wait(true, 120);
}

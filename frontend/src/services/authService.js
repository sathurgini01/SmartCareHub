import { createId } from '../utils/formatters';
import { isEmail, isLicenseNumber, isStrongPassword } from '../utils/validators';
import { clearSession, getDb, getSession, setDb, setSession, wait } from './storage';

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function bootstrapSession() {
  return wait(getSession());
}

export async function login({ email, password, role }) {
  const db = getDb();
  const collection = role === 'admin' ? db.admins : db.doctors;
  const user = collection.find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
  );

  if (!user) {
    throw new Error('Invalid credentials. Please check your email and password.');
  }

  const session = { user: sanitizeUser(user), role };
  setSession(session);
  return wait(session);
}

export async function registerDoctor(payload) {
  const db = getDb();

  if (!payload.fullName || !payload.email || !payload.password || !payload.specialization) {
    throw new Error('Please complete all required doctor registration fields.');
  }

  if (!isEmail(payload.email)) {
    throw new Error('Enter a valid email address.');
  }

  if (!isStrongPassword(payload.password)) {
    throw new Error('Password must be at least 8 characters and include uppercase and numbers.');
  }

  if (!isLicenseNumber(payload.licenseNumber)) {
    throw new Error('License number format is invalid.');
  }

  const exists = db.doctors.find((doctor) => doctor.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    throw new Error('A doctor account already exists with this email.');
  }

  const doctor = {
    id: createId('doc'),
    role: 'doctor',
    status: 'pending',
    submittedDate: new Date().toISOString(),
    phone: '',
    bio: '',
    ...payload
  };

  db.doctors.unshift(doctor);
  setDb(db);
  return wait(sanitizeUser(doctor));
}

export async function registerAdmin(payload) {
  const db = getDb();

  if (payload.accessKey !== 'SMARTCARE-ADMIN') {
    throw new Error('Admin access key is invalid.');
  }

  if (!isEmail(payload.email)) {
    throw new Error('Enter a valid email address.');
  }

  if (!isStrongPassword(payload.password)) {
    throw new Error('Password must be at least 8 characters and include uppercase and numbers.');
  }

  const exists = db.admins.find((admin) => admin.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    throw new Error('An admin account already exists with this email.');
  }

  const admin = {
    id: createId('admin'),
    role: 'admin',
    title: 'Operations Admin',
    ...payload
  };

  db.admins.unshift(admin);
  setDb(db);
  return wait(sanitizeUser(admin));
}

export async function logout() {
  clearSession();
  return wait(true, 120);
}

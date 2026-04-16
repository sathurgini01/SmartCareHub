import { getDb, setDb, wait } from './storage';

export async function getAdminDashboard() {
  const db = getDb();
  return wait({
    doctors: db.doctors,
    telemedicineSessions: db.telemedicineSessions
  });
}

export async function updateDoctorVerification(doctorId, status) {
  const db = getDb();
  db.doctors = db.doctors.map((doctor) => (doctor.id === doctorId ? { ...doctor, status } : doctor));
  setDb(db);
  return wait(true);
}

export async function deleteDoctorAccount(doctorId) {
  const db = getDb();
  db.doctors = db.doctors.filter((doctor) => doctor.id !== doctorId);
  setDb(db);
  return wait(true);
}

export async function getAdminProfile(adminId) {
  const db = getDb();
  return wait(db.admins.find((admin) => admin.id === adminId));
}

export async function updateAdminProfile(adminId, updates) {
  const db = getDb();
  db.admins = db.admins.map((admin) => (admin.id === adminId ? { ...admin, ...updates } : admin));
  setDb(db);
  return wait(db.admins.find((admin) => admin.id === adminId));
}

export async function deleteAdminProfile(adminId) {
  const db = getDb();
  db.admins = db.admins.filter((admin) => admin.id !== adminId);
  setDb(db);
  return wait(true);
}

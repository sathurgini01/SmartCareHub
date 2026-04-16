import { createId } from '../utils/formatters';
import { hasOverlap } from '../utils/validators';
import { getDb, setDb, wait } from './storage';

export async function getDoctorDashboard(doctorId) {
  const db = getDb();
  const doctor = db.doctors.find((item) => item.id === doctorId);
  const availability = db.availability.filter((item) => item.doctorId === doctorId);
  const appointments = db.appointments.filter((item) => item.doctorId === doctorId);
  const prescriptions = db.prescriptions.filter((item) => item.doctorId === doctorId);
  const reports = db.reports.filter((item) => item.doctorId === doctorId);
  const telemedicineSessions = db.telemedicineSessions.filter((item) => item.doctorId === doctorId);

  return wait({
    doctor,
    availability,
    appointments,
    prescriptions,
    reports,
    telemedicineSessions
  });
}

export async function updateDoctorProfile(doctorId, updates) {
  const db = getDb();
  const index = db.doctors.findIndex((item) => item.id === doctorId);
  db.doctors[index] = { ...db.doctors[index], ...updates };
  setDb(db);
  return wait(db.doctors[index]);
}

export async function deleteDoctorProfile(doctorId) {
  const db = getDb();
  db.doctors = db.doctors.filter((item) => item.id !== doctorId);
  db.availability = db.availability.filter((item) => item.doctorId !== doctorId);
  db.appointments = db.appointments.filter((item) => item.doctorId !== doctorId);
  db.prescriptions = db.prescriptions.filter((item) => item.doctorId !== doctorId);
  db.reports = db.reports.filter((item) => item.doctorId !== doctorId);
  db.telemedicineSessions = db.telemedicineSessions.filter((item) => item.doctorId !== doctorId);
  setDb(db);
  return wait(true);
}

export async function saveAvailability(doctorId, slot, editingId = null) {
  const db = getDb();
  const currentSlots = db.availability.filter((item) => item.doctorId === doctorId);

  if (hasOverlap(slot, currentSlots, editingId)) {
    throw new Error('This slot overlaps with an existing availability entry.');
  }

  if (editingId) {
    db.availability = db.availability.map((item) =>
      item.id === editingId ? { ...item, ...slot, doctorId } : item
    );
  } else {
    db.availability.unshift({
      id: createId('slot'),
      doctorId,
      status: 'Open',
      ...slot
    });
  }

  setDb(db);
  return wait(true);
}

export async function deleteAvailability(slotId) {
  const db = getDb();
  db.availability = db.availability.filter((item) => item.id !== slotId);
  setDb(db);
  return wait(true);
}

export async function updateAppointmentStatus(appointmentId, status) {
  const db = getDb();
  db.appointments = db.appointments.map((item) =>
    item.id === appointmentId ? { ...item, status } : item
  );
  setDb(db);
  return wait(true);
}

export async function rescheduleAppointment(appointmentId, appointmentDate, time) {
  const db = getDb();
  db.appointments = db.appointments.map((item) =>
    item.id === appointmentId ? { ...item, appointmentDate, time, status: 'rescheduled' } : item
  );
  setDb(db);
  return wait(true);
}

export async function savePrescription(doctorId, payload, editingId = null) {
  const db = getDb();

  if (editingId) {
    db.prescriptions = db.prescriptions.map((item) =>
      item.id === editingId ? { ...item, ...payload, doctorId } : item
    );
  } else {
    db.prescriptions.unshift({
      id: createId('rx'),
      doctorId,
      ...payload
    });
  }

  setDb(db);
  return wait(true);
}

export async function deletePrescription(prescriptionId) {
  const db = getDb();
  db.prescriptions = db.prescriptions.filter((item) => item.id !== prescriptionId);
  setDb(db);
  return wait(true);
}

export async function saveTelemedicineSession(doctorId, action, sessionId = null) {
  const db = getDb();

  if (action === 'create') {
    db.telemedicineSessions.unshift({
      id: createId('tm'),
      doctorId,
      patientName: 'New Telemedicine Session',
      appointmentInfo: 'Manual session launch',
      status: 'Scheduled',
      provider: 'Twilio-ready',
      quickNotes: 'Session created from dashboard quick actions.'
    });
  }

  if (action === 'join' || action === 'end') {
    db.telemedicineSessions = db.telemedicineSessions.map((item) =>
      item.id === sessionId
        ? { ...item, status: action === 'join' ? 'Live' : 'Completed' }
        : item
    );
  }

  setDb(db);
  return wait(true);
}

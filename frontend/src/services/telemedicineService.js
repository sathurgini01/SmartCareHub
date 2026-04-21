import { wait } from './storage';
import appointmentService from './appointmentService';
import doctorService, { getDoctorDashboard } from './doctorService';

const COMPLETED_SESSIONS_KEY = 'smartcare-telemedicine-completed-sessions';

function readCompletedSessions() {
  try {
    return JSON.parse(sessionStorage.getItem(COMPLETED_SESSIONS_KEY) || '[]');
  } catch (_error) {
    return [];
  }
}

function writeCompletedSessions(sessions) {
  sessionStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(sessions));
}

function formatAppointmentTime(appointment) {
  if (appointment?.timeSlot?.start) {
    return `${appointment.timeSlot.start} - ${appointment.timeSlot.end}`;
  }

  return appointment?.time || 'Not available';
}

function formatDisplayDate(value) {
  if (!value) return 'Date not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const buildMockSession = (appointmentId = 'demo-appointment') => ({
  id: `tm-${appointmentId}`,
  appointmentId,
  sessionType: 'Video Consultation',
  status: 'waiting',
  connectionState: 'Ready',
  appointment: {
    id: appointmentId,
    date: new Date().toISOString(),
    time: '10:30 AM - 11:00 AM',
    specialty: 'General Medicine',
    consultationType: 'Online',
    status: 'confirmed',
  },
  doctor: {
    id: 'doctor-demo',
    name: 'Dr. SmartCare Consultant',
    specialty: 'General Medicine',
    hospital: 'SmartCareHub Virtual Clinic',
    availability: 'Available',
  },
  patient: {
    id: 'patient-demo',
    name: 'Patient User',
    age: 32,
    gender: 'Not specified',
    symptomSummary: 'Follow-up consultation for recent symptoms.',
    medicalHistory: 'No critical medical history recorded in the mock session.',
  },
  summary:
    'Consultation summary will appear here after the doctor completes the session.',
  prescription: {
    status: 'Draft',
    items: ['Prescription details will be available after consultation.'],
  },
});

const buildSessionFromAppointment = async (appointment) => {
  let doctorProfile = null;

  if (appointment?.doctorId) {
    try {
      const response = await doctorService.getById(appointment.doctorId);
      doctorProfile = response.data?.data;
    } catch (_error) {
      doctorProfile = null;
    }
  }

  return {
    id: `tm-${appointment._id || appointment.id}`,
    appointmentId: appointment._id || appointment.id,
    sessionType: appointment.consultationType || 'Video Consultation',
    status: appointment.status === 'completed' ? 'completed' : 'waiting',
    connectionState: 'Ready',
    appointment: {
      id: appointment._id || appointment.id,
      date: appointment.appointmentDate || appointment.date || appointment.createdAt,
      time: formatAppointmentTime(appointment),
      specialty: appointment.specialty || doctorProfile?.specialty || 'General Medicine',
      consultationType: appointment.consultationType || 'Online',
      status: appointment.status || 'confirmed',
      appointmentNumber: appointment.appointmentNumber || '',
    },
    doctor: {
      id: appointment.doctorId || doctorProfile?._id || doctorProfile?.id || 'doctor',
      name: appointment.doctorName || doctorProfile?.name || 'Doctor',
      specialty: appointment.specialty || doctorProfile?.specialty || 'General Medicine',
      hospital: doctorProfile?.hospital || appointment.hospital || 'SmartCareHub Virtual Clinic',
      availability: ['confirmed', 'rescheduled'].includes(appointment.status) ? 'Available for session' : appointment.status || 'Scheduled',
    },
    patient: {
      id: appointment.patientId || 'patient',
      name: appointment.patientName || 'Patient',
      email: appointment.patientEmail || '',
      phone: appointment.patientPhone || '',
      age: appointment.patientAge || 'Not recorded',
      gender: appointment.patientGender || 'Not recorded',
      symptomSummary: appointment.reason || 'No symptom summary recorded.',
      medicalHistory: appointment.notes || 'No medical history notes recorded.',
    },
    summary:
      appointment.notes || 'Consultation summary will appear here after the doctor completes the session.',
    prescription: {
      status: appointment.paymentStatus === 'paid' ? 'Ready after consultation' : 'Pending consultation',
      items: ['Prescription details will be available after consultation.'],
    },
  };
};

export async function getTelemedicineSessionByAppointmentId(appointmentId) {
  if (!appointmentId || appointmentId === 'demo-session') {
    return wait(buildMockSession(appointmentId), 260);
  }

  try {
    const response = await appointmentService.getById(appointmentId);
    const appointment = response.data?.data;
    if (appointment) return buildSessionFromAppointment(appointment);
  } catch (_error) {
    // Keep the UI usable if the appointment service is unavailable.
  }

  return wait(buildMockSession(appointmentId), 260);
}

export async function joinTelemedicineSession(sessionId) {
  return wait({ success: true, sessionId, status: 'live', patientJoined: true }, 180);
}

export async function startTelemedicineSession(sessionId) {
  return wait({ success: true, sessionId, status: 'live', doctorJoined: true }, 180);
}

export async function endTelemedicineSession(sessionOrId) {
  const session = typeof sessionOrId === 'object' ? sessionOrId : { id: sessionOrId };
  const completedSession = {
    ...session,
    status: 'completed',
    endedAt: new Date().toISOString(),
  };

  const existing = readCompletedSessions();
  const next = [
    completedSession,
    ...existing.filter((item) => item.appointmentId !== completedSession.appointmentId && item.id !== completedSession.id),
  ];
  writeCompletedSessions(next);

  return wait({ success: true, sessionId: completedSession.id, status: 'completed', data: completedSession }, 180);
}

export async function saveConsultationNotes(sessionId, notes) {
  return wait({ success: true, sessionId, notes, savedAt: new Date().toISOString() }, 180);
}

export async function issuePrescription(sessionId, payload = {}) {
  return wait({
    success: true,
    sessionId,
    prescription: {
      status: 'Issued',
      issuedAt: new Date().toISOString(),
      items: payload.items || ['Medication and advice recorded by doctor.'],
    },
  }, 220);
}

export async function getPatientTelemedicineHistory() {
  const completed = readCompletedSessions();

  try {
    const response = await appointmentService.getMyAppointments({ limit: 50 });
    const appointments = response.data?.data || [];
    const appointmentSessions = await Promise.all(
      appointments
        .filter((appointment) => ['confirmed', 'rescheduled', 'completed'].includes(appointment.status))
        .map(buildSessionFromAppointment)
    );

    const merged = [...completed, ...appointmentSessions].reduce((acc, session) => {
      const key = session.appointmentId || session.id;
      if (!acc.some((item) => (item.appointmentId || item.id) === key)) acc.push(session);
      return acc;
    }, []);

    return merged;
  } catch (_error) {
    return completed;
  }
}

export async function getDoctorTelemedicineHistory(doctorId) {
  const completed = readCompletedSessions();

  try {
    const data = await getDoctorDashboard(doctorId);
    const appointmentSessions = data.appointments
      .filter((appointment) => ['confirmed', 'rescheduled', 'completed'].includes(appointment.status))
      .map((appointment) => ({
        id: `tm-${appointment.id}`,
        appointmentId: appointment.id,
        patientName: appointment.patientName || 'Patient',
        patientId: appointment.patientId || '',
        date: appointment.appointmentDate,
        time: appointment.time,
        specialty: appointment.specialty || 'General Medicine',
        appointmentStatus: appointment.status,
        appointmentNumber: appointment.appointmentNumber || '',
        appointmentInfo: `${formatDisplayDate(appointment.appointmentDate)} at ${appointment.time || 'time not available'}`,
        status: appointment.status === 'completed' ? 'Completed' : 'Scheduled',
        provider: 'SmartCareHub Video',
        quickNotes: appointment.reason || 'No consultation reason recorded.',
      }));

    const completedDoctorSessions = completed.map((session) => ({
      id: session.id,
      appointmentId: session.appointmentId,
      patientName: session.patient?.name || 'Patient',
      patientId: session.patient?.id || '',
      date: session.appointment?.date || session.endedAt,
      time: session.appointment?.time || '',
      specialty: session.appointment?.specialty || 'General Medicine',
      appointmentStatus: 'completed',
      appointmentNumber: session.appointment?.appointmentNumber || '',
      appointmentInfo: `${formatDisplayDate(session.appointment?.date || session.endedAt)} at ${session.appointment?.time || 'time not available'}`,
      status: 'Completed',
      provider: 'SmartCareHub Video',
      quickNotes: session.summary || session.patient?.symptomSummary || 'Completed telemedicine consultation.',
    }));

    return [...completedDoctorSessions, ...appointmentSessions].reduce((acc, session) => {
      const key = session.appointmentId || session.id;
      if (!acc.some((item) => (item.appointmentId || item.id) === key)) acc.push(session);
      return acc;
    }, []);
  } catch (_error) {
    return completed.map((session) => ({
      id: session.id,
      appointmentId: session.appointmentId,
      patientName: session.patient?.name || 'Patient',
      patientId: session.patient?.id || '',
      date: session.appointment?.date || session.endedAt,
      time: session.appointment?.time || '',
      specialty: session.appointment?.specialty || 'General Medicine',
      appointmentStatus: 'completed',
      appointmentNumber: session.appointment?.appointmentNumber || '',
      appointmentInfo: `${formatDisplayDate(session.appointment?.date || session.endedAt)} at ${session.appointment?.time || 'time not available'}`,
      status: 'Completed',
      provider: 'SmartCareHub Video',
      quickNotes: session.summary || 'Completed telemedicine consultation.',
    }));
  }
}

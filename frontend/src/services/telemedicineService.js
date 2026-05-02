import { wait } from './storage';
import axios from '../api/axios';
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
  sessionLink: `https://meet.jit.si/smartcarehub-${appointmentId}`,
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
    sessionLink: `https://meet.jit.si/smartcarehub-${appointment._id || appointment.id}`,
  };
};

const buildSessionFromBackend = (data, appointment) => {
  return {
    id: data._id,
    appointmentId: data.appointmentId,
    sessionType: data.sessionType === 'video' ? 'Video Consultation' : 'Audio Consultation',
    status: data.status,
    connectionState: 'Connected',
    sessionLink: data.sessionLink,
    appointment: {
      id: data.appointmentId,
      date: data.scheduledStartTime,
      time: appointment ? formatAppointmentTime(appointment) : 'Scheduled',
      specialty: data.specialty,
      consultationType: 'Online',
      status: data.status === 'ended' ? 'completed' : 'confirmed',
    },
    doctor: {
      id: data.doctorId,
      name: data.doctorName || 'Doctor',
      specialty: data.specialty,
      hospital: 'SmartCareHub Virtual Clinic',
      availability: 'Online',
    },
    patient: {
      id: data.patientId,
      name: data.patientName || 'Patient',
      age: appointment?.patientAge || 'N/A',
      gender: appointment?.patientGender || 'N/A',
      symptomSummary: data.reason || 'No summary',
      medicalHistory: appointment?.notes || 'None',
      email: appointment?.patientEmail || '',
      phone: appointment?.patientPhone || '',
    },
    summary: data.summary || '',
    consultationNotes: data.consultationNotes || '',
    prescription: data.prescription || { status: 'not_issued', items: [] },
  };
};

export async function getTelemedicineSessionByAppointmentId(appointmentId) {
  try {
    // 1. Try to fetch existing session
    const response = await axios.get(`/api/telemedicine/sessions/appointment/${appointmentId}`);
    if (response.data.success) {
      // Get appointment details for extra info
      const apptRes = await appointmentService.getById(appointmentId);
      return buildSessionFromBackend(response.data.data, apptRes.data?.data);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      // 2. If not found, create it from appointment data
      try {
        const apptRes = await appointmentService.getById(appointmentId);
        const appt = apptRes.data?.data;
        if (appt) {
          const createRes = await axios.post('/api/telemedicine/sessions', {
            appointmentId: appt._id,
            doctorId: appt.doctorId,
            patientId: appt.patientId,
            doctorName: appt.doctorName,
            patientName: appt.patientName,
            specialty: appt.specialty,
            reason: appt.reason,
            scheduledStartTime: appt.appointmentDate,
            patientEmail: appt.patientEmail,
            doctorEmail: appt.doctorEmail
          });
          return buildSessionFromBackend(createRes.data.data, appt);
        }
      } catch (createErr) {
        console.error('Failed to create telemedicine session:', createErr);
      }
    }
  }

  return wait(buildMockSession(appointmentId), 260);
}

export async function joinTelemedicineSession(sessionId) {
  if (String(sessionId).startsWith('tm-')) {
    return { success: true, message: "Joined mock session" };
  }
  const res = await axios.post(`/api/telemedicine/sessions/${sessionId}/join`, { role: 'patient' });
  return res.data;
}

export async function startTelemedicineSession(sessionId) {
  if (String(sessionId).startsWith('tm-')) {
    return { success: true, message: "Started mock session" };
  }
  const res = await axios.post(`/api/telemedicine/sessions/${sessionId}/join`, { role: 'doctor' });
  return res.data;
}

export async function endTelemedicineSession(session) {
  const res = await axios.patch(`/api/telemedicine/sessions/${session.id}/end`, {
    summary: session.summary,
    notes: session.consultationNotes
  });
  return res.data;
}

export async function saveConsultationNotes(sessionId, notes) {
  const res = await axios.patch(`/api/telemedicine/sessions/${sessionId}/notes`, { notes });
  return res.data;
}

export async function issuePrescription(sessionId, payload = {}) {
  const res = await axios.post(`/api/telemedicine/sessions/${sessionId}/prescription`, {
    prescriptionId: payload.prescriptionId,
    items: payload.items
  });
  return res.data;
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

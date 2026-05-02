import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCamera, FiCameraOff, FiCheckCircle, FiClock, FiEdit3, FiFileText, FiMic, FiMicOff, FiPhoneOff, FiPlayCircle } from 'react-icons/fi';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import {
  endTelemedicineSession,
  getTelemedicineSessionByAppointmentId,
  issuePrescription,
  saveConsultationNotes,
  startTelemedicineSession,
} from '../../services/telemedicineService';
import { doctorNavItems } from '../../utils/navigation';

const statusStyle = (status) => ({
  display: 'inline-flex',
  borderRadius: '999px',
  padding: '5px 10px',
  fontSize: '12px',
  fontWeight: 800,
  color: status === 'live' ? '#22c55e' : status === 'completed' ? '#94a3b8' : '#f59e0b',
  background: status === 'live' ? 'rgba(34,197,94,0.12)' : status === 'completed' ? 'rgba(148,163,184,0.12)' : 'rgba(245,158,11,0.12)',
});

const formatSessionDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function DetailCard({ title, children }) {
  return (
    <section className="card" style={{ borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ display: 'grid', gap: '10px', color: '#cbd5e1' }}>{children}</div>
    </section>
  );
}

function DoctorTelemedicineSession() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getTelemedicineSessionByAppointmentId(appointmentId)
      .then(setSession)
      .catch(() => setError('No telemedicine session found for this appointment.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  useEffect(() => {
    if (!started || ended) return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [ended, started]);

  const status = ended ? 'completed' : started ? 'live' : 'waiting';
  const displayTime = useMemo(() => {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }, [seconds]);

  const startSession = async () => {
    await startTelemedicineSession(session.id);
    setStarted(true);
    if (session.sessionLink) {
      window.open(session.sessionLink, '_blank');
    }
  };

  const finishSession = async () => {
    await endTelemedicineSession({
      ...session,
      summary: notes || session.summary,
    });
    setEnded(true);
    setStarted(false);
  };

  const saveNotes = async () => {
    await saveConsultationNotes(session.id, notes);
    setMessage('Consultation notes saved.');
  };

  const createPrescription = async () => {
    await issuePrescription(session.id, { items: ['Mock prescription issued from doctor telemedicine page.'] });
    setMessage('Prescription issued for this consultation.');
    navigate('/doctor/prescriptions');
  };

  if (loading) return <ShellLayout navItems={doctorNavItems}><div className="loading"><span className="spinner" /></div></ShellLayout>;
  if (error || !session) return <ShellLayout navItems={doctorNavItems}><div className="card"><h2>No session found</h2><p className="text-muted">{error}</p></div></ShellLayout>;

  return (
    <ShellLayout navItems={doctorNavItems}>
      <div style={{ display: 'grid', gap: '20px' }}>
        <header className="card" style={{ borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <p className="form-label">Doctor Telemedicine</p>
            <h1 style={{ margin: 0 }}>Consultation Room</h1>
            <p className="text-muted">Appointment #{session.appointment.id}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={statusStyle(status)}>{status}</span>
            <span className="btn btn-secondary"><FiClock /> {displayTime}</span>
            <span className="btn btn-secondary">{session.connectionState}</span>
          </div>
        </header>

        {message && <div className="alert-success">{message}</div>}

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(320px,0.7fr)', gap: '20px' }}>
          <div className="card" style={{ minHeight: '430px', borderRadius: '8px', background: '#020617', position: 'relative', overflow: 'hidden' }}>
            {!started && !ended && (
              <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 2, background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.34)', borderRadius: '8px', padding: '12px', color: '#fde68a' }}>
                Waiting for patient to join. Start the session when you are ready.
              </div>
            )}
            <div style={{ height: '100%', minHeight: '390px', display: 'grid', placeItems: 'center', color: '#94a3b8', textAlign: 'center' }}>
              {started ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '100%', gap: '10px' }}>
                  <FiCamera size={46} color="#22c55e" />
                  <h2 style={{ color: '#22c55e', margin: 0 }}>Session is Live</h2>
                  <p>Your secure video room has been opened in a new tab.</p>
                  <button className="btn btn-primary" onClick={() => window.open(session.sessionLink, '_blank')} style={{ marginTop: '10px' }}>
                    <FiPlayCircle /> Re-open Video Room
                  </button>
                </div>
              ) : (
                <div>
                  <FiCamera size={46} />
                  <h2>{ended ? 'Session completed' : 'Patient waiting room'}</h2>
                  <p>{ended ? 'The consultation has concluded.' : 'Ready to begin. Click "Start Session" to open the video room.'}</p>
                </div>
              )}
            </div>
            <div style={{ position: 'absolute', right: 18, bottom: 18, width: 180, height: 112, borderRadius: '8px', border: '1px solid #334155', background: cameraOn ? '#111827' : '#1f2937', display: 'grid', placeItems: 'center', color: '#cbd5e1' }}>
              {cameraOn ? 'Doctor preview' : <FiCameraOff size={28} />}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <DetailCard title="Appointment Details">
              <span>ID: {session.appointment.id}</span>
              <span>Date: {formatSessionDate(session.appointment.date)}</span>
              <span>Time: {session.appointment.time}</span>
              <span>Specialty: {session.appointment.specialty}</span>
              <span>Type: {session.appointment.consultationType}</span>
            </DetailCard>
            <DetailCard title="Doctor Info">
              <strong>{user?.fullName || session.doctor.name}</strong>
              <span>{session.doctor.specialty}</span>
              <span>{session.doctor.hospital}</span>
              <span>Status: {session.doctor.availability}</span>
            </DetailCard>
            <DetailCard title="Patient Details">
              <strong>{session.patient.name}</strong>
              <span>ID: {session.patient.id}</span>
              <span>Age: {session.patient.age}</span>
              <span>Gender: {session.patient.gender}</span>
              <span>{session.patient.symptomSummary}</span>
              <span>{session.patient.medicalHistory}</span>
            </DetailCard>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,0.45fr)', gap: '20px' }}>
          <div className="card" style={{ borderRadius: '8px' }}>
            <h3><FiEdit3 /> Consultation Notes</h3>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Record diagnosis, observations, care plan, and follow-up instructions..."
              style={{ minHeight: '150px', resize: 'vertical' }}
            />
            <button className="btn btn-blue" onClick={saveNotes} style={{ marginTop: '12px' }}>Save Notes</button>
          </div>
          <div className="card" style={{ borderRadius: '8px' }}>
            <h3><FiFileText /> Prescription</h3>
            <p className="text-muted">Issue a prescription during or after the consultation.</p>
            <button className="btn btn-primary" onClick={createPrescription}><FiCheckCircle /> Issue Prescription</button>
          </div>
        </section>

        <section className="card" style={{ borderRadius: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!started && !ended && <button className="btn btn-primary" onClick={startSession}><FiPlayCircle /> Start Session</button>}
          <button className="btn btn-secondary" onClick={() => setMuted((value) => !value)}>{muted ? <FiMicOff /> : <FiMic />} {muted ? 'Unmute' : 'Mute'}</button>
          <button className="btn btn-secondary" onClick={() => setCameraOn((value) => !value)}>{cameraOn ? <FiCamera /> : <FiCameraOff />} {cameraOn ? 'Camera Off' : 'Camera On'}</button>
          {!ended && <button className="btn btn-danger" onClick={finishSession}><FiPhoneOff /> End Session</button>}
        </section>
      </div>
    </ShellLayout>
  );
}

export default DoctorTelemedicineSession;

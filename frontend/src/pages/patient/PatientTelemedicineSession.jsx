import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCamera, FiCameraOff, FiClock, FiDownload, FiFileText, FiMic, FiMicOff, FiPhoneOff, FiPlayCircle, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  endTelemedicineSession,
  getTelemedicineSessionByAppointmentId,
  joinTelemedicineSession,
} from '../../services/telemedicineService';

const badgeStyle = (status) => ({
  display: 'inline-flex',
  alignItems: 'center',
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

function InfoCard({ title, children }) {
  return (
    <section className="card" style={{ borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ display: 'grid', gap: '10px', color: '#cbd5e1' }}>{children}</div>
    </section>
  );
}

function PatientTelemedicineSession() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [joined, setJoined] = useState(false);
  const [ended, setEnded] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    getTelemedicineSessionByAppointmentId(appointmentId)
      .then(setSession)
      .catch(() => setError('No telemedicine session available for this appointment.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  useEffect(() => {
    if (!joined || ended) return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [ended, joined]);

  const status = ended ? 'completed' : joined ? 'live' : 'waiting';
  const displayTime = useMemo(() => {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }, [seconds]);

  const joinSession = async () => {
    await joinTelemedicineSession(session.id);
    setJoined(true);
    if (session.sessionLink) {
      window.open(session.sessionLink, '_blank');
    }
  };

  const leaveSession = async () => {
    await endTelemedicineSession(session);
    setEnded(true);
    setJoined(false);
  };

  if (loading) return <div className="loading"><span className="spinner" /></div>;
  if (error || !session) return <div className="card"><h2>No session available</h2><p className="text-muted">{error}</p></div>;

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <header className="card" style={{ borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <p className="form-label">Patient Telemedicine</p>
          <h1 style={{ margin: 0 }}>Video Consultation</h1>
          <p className="text-muted">Appointment #{session.appointment.id}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={badgeStyle(status)}>{status}</span>
          <span className="btn btn-secondary"><FiClock /> {displayTime}</span>
          <span className="btn btn-secondary">{session.connectionState}</span>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(280px,0.6fr)', gap: '20px' }}>
        <div className="card" style={{ minHeight: '430px', borderRadius: '8px', background: '#020617', position: 'relative', overflow: 'hidden' }}>
          {!joined && !ended && (
            <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 2, background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.34)', borderRadius: '8px', padding: '12px', color: '#fde68a' }}>
              Waiting for doctor to join. You can join and stay in the waiting room.
            </div>
          )}
          <div style={{ height: '100%', minHeight: '390px', display: 'grid', placeItems: 'center', color: '#94a3b8', textAlign: 'center' }}>
            {joined ? (
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
                <h2>{ended ? 'Session ended' : 'Doctor has not joined yet'}</h2>
                <p>{ended ? 'The consultation has concluded.' : 'Ready to begin. Click "Join Session" to enter the waiting room.'}</p>
              </div>
            )}
          </div>
          <div style={{ position: 'absolute', right: 18, bottom: 18, width: 180, height: 112, borderRadius: '8px', border: '1px solid #334155', background: cameraOn ? '#111827' : '#1f2937', display: 'grid', placeItems: 'center', color: '#cbd5e1' }}>
            {cameraOn ? 'Your preview' : <FiCameraOff size={28} />}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <InfoCard title="Appointment Details">
            <span>ID: {session.appointment.id}</span>
            <span>Date: {formatSessionDate(session.appointment.date)}</span>
            <span>Time: {session.appointment.time}</span>
            <span>Specialty: {session.appointment.specialty}</span>
            <span>Type: {session.sessionType}</span>
          </InfoCard>
          <InfoCard title="Doctor Details">
            <strong>{session.doctor.name}</strong>
            <span>{session.doctor.specialty}</span>
            <span>{session.doctor.hospital}</span>
            <span>Status: {session.doctor.availability}</span>
          </InfoCard>
          <InfoCard title="Patient Summary">
            <span>{user?.name || session.patient.name}</span>
            <span>ID: {user?.id || session.patient.id}</span>
            <span>Age: {session.patient.age}</span>
            <span>Gender: {session.patient.gender}</span>
            {session.patient.email && <span>Email: {session.patient.email}</span>}
            {session.patient.phone && <span>Phone: {session.patient.phone}</span>}
            <span>{session.patient.symptomSummary}</span>
          </InfoCard>
        </div>
      </section>

      <section className="card" style={{ borderRadius: '8px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!joined && !ended && <button className="btn btn-primary" onClick={joinSession}><FiPlayCircle /> Join Session</button>}
          <button className="btn btn-secondary" onClick={() => setMuted((value) => !value)}>{muted ? <FiMicOff /> : <FiMic />} {muted ? 'Unmute' : 'Mute'}</button>
          <button className="btn btn-secondary" onClick={() => setCameraOn((value) => !value)}>{cameraOn ? <FiCamera /> : <FiCameraOff />} {cameraOn ? 'Camera Off' : 'Camera On'}</button>
          {!ended && <button className="btn btn-danger" onClick={leaveSession}><FiPhoneOff /> End Session</button>}
        </div>
        {ended && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link className="btn btn-secondary" to="/prescriptions"><FiFileText /> View Prescription</Link>
            <button className="btn btn-secondary"><FiDownload /> Download Prescription</button>
            <button className="btn btn-secondary"><FiStar /> Give Feedback</button>
            <button className="btn btn-primary">View Consultation Summary</button>
          </div>
        )}
      </section>
    </div>
  );
}

export default PatientTelemedicineSession;

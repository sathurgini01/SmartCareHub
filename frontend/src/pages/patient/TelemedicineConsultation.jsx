import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getSessionByAppointment, joinSession } from '../../api/telemedicineApi';

function TelemedicineConsultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [session, setSession]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [joining, setJoining]   = useState(false);
  const [meetingUrl, setMeetingUrl] = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    getSessionByAppointment(appointmentId)
      .then((r) => {
        const s = r.data.data;
        setSession(s);
        // backend field is sessionLink (not meetingLink)
        if (s.status === 'active' && s.sessionLink) setMeetingUrl(s.sessionLink);
      })
      .catch(() => setError('Session not found or not yet created by the doctor.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleJoin = async () => {
    if (!session?._id) return;
    setJoining(true);
    setError('');
    try {
      // backend requires role in body
      const res = await joinSession(session._id, 'patient');
      const url = res.data.data?.sessionLink || session.sessionLink;
      setMeetingUrl(url);
      setSession((p) => ({ ...p, status: 'active', patientJoined: true }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join session.');
    } finally {
      setJoining(false);
    }
  };

  const statusLabel = (s) => {
    if (s === 'active')    return { label: 'Session Active',    cls: 'active'  };
    if (s === 'ended')     return { label: 'Session Ended',     cls: 'ended'   };
    if (s === 'cancelled') return { label: 'Session Cancelled', cls: 'ended'   };
    return { label: 'Waiting for Doctor', cls: 'waiting' }; // 'created'
  };

  if (loading) return (
    <div className="page"><Navbar />
      <div className="loading"><span className="spinner" /><span>Loading session...</span></div>
    </div>
  );

  const { label, cls } = statusLabel(session?.status);

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patient/notifications')}>
              ← Back
            </button>
            <div className="page-hero" style={{ marginBottom: 0, flex: 1, padding: '18px 24px' }}>
              <div className="page-hero-icon" style={{ fontSize: '36px' }}>🎥</div>
              <div className="page-hero-content">
                <h1 style={{ fontSize: '22px' }}>Video Consultation</h1>
                <p style={{ fontSize: '13px' }}>Secure, end-to-end encrypted telemedicine session</p>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          {/* Session Info */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p className="card-title">
                  {session?.doctorName ? `Dr. ${session.doctorName}` : 'Consultation Session'}
                </p>
                <p className="card-sub">Appointment ID: {appointmentId}</p>
              </div>
              <div className="session-status">
                <span className={`status-dot ${cls}`} />
                <span>{label}</span>
              </div>
            </div>

            {session && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="form-label">Status</p>
                  <span className={`badge ${session.status === 'active' ? 'badge-green' : session.status === 'created' ? 'badge-yellow' : 'badge-gray'}`}>
                    {session.status}
                  </span>
                </div>
                <div>
                  <p className="form-label">Doctor Joined</p>
                  <span className={`badge ${session.doctorJoined ? 'badge-green' : 'badge-gray'}`}>
                    {session.doctorJoined ? 'Yes' : 'Waiting'}
                  </span>
                </div>
                <div>
                  <p className="form-label">Patient Joined</p>
                  <span className={`badge ${session.patientJoined ? 'badge-green' : 'badge-gray'}`}>
                    {session.patientJoined ? 'Yes' : 'Not yet'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Join Button */}
          {!meetingUrl && session?.status !== 'ended' && session?.status !== 'cancelled' && (
            <div className="card" style={{ marginBottom: '20px', textAlign: 'center', padding: '32px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '15px' }}>
                {session?.doctorJoined
                  ? 'The doctor is ready. Click below to join the consultation.'
                  : 'Waiting for the doctor to start the session. You can join early.'}
              </p>
              <button
                className="btn btn-success"
                onClick={handleJoin}
                disabled={joining}
                style={{ minWidth: '200px', justifyContent: 'center' }}
              >
                {joining ? <><span className="spinner" /> Joining...</> : '🎥 Join Consultation'}
              </button>
            </div>
          )}

          {/* Video Frame */}
          {meetingUrl && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p className="section-title">Live Session</p>
                <div className="session-status">
                  <span className="status-dot active" />
                  <span>Live</span>
                </div>
              </div>
              <div className="video-container">
                <iframe
                  src={meetingUrl}
                  allow="camera; microphone; fullscreen; display-capture"
                  title="Consultation Video"
                />
              </div>
              <div className="alert alert-info" style={{ marginTop: '12px' }}>
                ℹ Allow camera and microphone access when prompted by your browser.
              </div>
            </div>
          )}

          {session?.status === 'ended' && (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <p className="card-title">Consultation Completed</p>
              <p className="card-sub" style={{ marginTop: '8px', marginBottom: '20px' }}>
                Your consultation has ended. Check your notifications for the summary.
              </p>
              <button className="btn btn-secondary" onClick={() => navigate('/patient/notifications')}>
                View Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TelemedicineConsultation;

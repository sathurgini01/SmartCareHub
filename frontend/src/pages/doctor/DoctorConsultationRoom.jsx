import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getSessionByAppointment, joinSession, endSession, cancelSession } from '../../api/telemedicineApi';

function DoctorConsultationRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [session, setSession]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [meetingUrl, setMeetingUrl] = useState(null);
  const [error, setError]         = useState('');
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    getSessionByAppointment(appointmentId)
      .then((r) => {
        const s = r.data.data;
        setSession(s);
        // backend field is sessionLink (not meetingLink)
        if (s.status === 'active' && s.sessionLink) setMeetingUrl(s.sessionLink);
      })
      .catch(() => setError('Session not found.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleJoin = async () => {
    setActionLoading('join');
    setError('');
    try {
      // backend requires role in body
      const res = await joinSession(session._id, 'doctor');
      const url = res.data.data?.sessionLink || session.sessionLink;
      setMeetingUrl(url);
      setSession((p) => ({ ...p, status: 'active', doctorJoined: true }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join session.');
    } finally {
      setActionLoading('');
    }
  };

  const handleEnd = async () => {
    setActionLoading('end');
    setError('');
    try {
      await endSession(session._id);
      setSession((p) => ({ ...p, status: 'ended' }));
      setMeetingUrl(null);
      setShowConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end session.');
    } finally {
      setActionLoading('');
    }
  };

  const handleCancel = async () => {
    setActionLoading('cancel');
    setError('');
    try {
      await cancelSession(session._id);
      setSession((p) => ({ ...p, status: 'cancelled' }));
      setShowConfirm(null);
      navigate('/doctor/consultations');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel session.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return (
    <div className="page"><Navbar />
      <div className="loading"><span className="spinner" /><span>Loading session...</span></div>
    </div>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/doctor/consultations')}>
              ← Back
            </button>
            <div className="page-header" style={{ marginBottom: 0 }}>
              <h1>🎥 Consultation Room</h1>
            </div>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          {/* Confirm Modal */}
          {showConfirm && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
              <div className="card" style={{ maxWidth:'400px', width:'100%', margin:'24px' }}>
                <p className="card-title" style={{ marginBottom: '8px' }}>
                  {showConfirm === 'end' ? '⚠ End Session' : '⚠ Cancel Session'}
                </p>
                <p className="text-muted" style={{ marginBottom: '20px', fontSize: '14px' }}>
                  {showConfirm === 'end'
                    ? 'Are you sure you want to end this consultation? This will notify the patient.'
                    : 'Are you sure you want to cancel? This action cannot be undone.'}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setShowConfirm(null)}>No, Go Back</button>
                  <button
                    className="btn btn-primary"
                    onClick={showConfirm === 'end' ? handleEnd : handleCancel}
                    disabled={!!actionLoading}
                  >
                    {actionLoading ? <><span className="spinner" /> Processing...</> : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Session Info */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p className="card-title">Patient: {session?.patientName || 'Patient'}</p>
                <p className="card-sub">Appointment ID: {appointmentId}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* 'created' = scheduled (backend status) */}
                {session?.status === 'created' && (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleJoin}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === 'join' ? <><span className="spinner" /> Starting...</> : '🎥 Start Session'}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowConfirm('cancel')}>
                      Cancel
                    </button>
                  </>
                )}
                {session?.status === 'active' && (
                  <>
                    {!meetingUrl && (
                      <button className="btn btn-success btn-sm" onClick={handleJoin} disabled={!!actionLoading}>
                        {actionLoading === 'join' ? <><span className="spinner" /></> : '🎥 Rejoin'}
                      </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={() => setShowConfirm('end')} disabled={!!actionLoading}>
                      ⏹ End Session
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div>
                <p className="form-label">Status</p>
                <span className={`badge ${session?.status === 'active' ? 'badge-green' : session?.status === 'ended' ? 'badge-gray' : session?.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                  {session?.status}
                </span>
              </div>
              <div>
                <p className="form-label">Doctor Joined</p>
                <span className={`badge ${session?.doctorJoined ? 'badge-green' : 'badge-gray'}`}>
                  {session?.doctorJoined ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <p className="form-label">Patient Joined</p>
                <span className={`badge ${session?.patientJoined ? 'badge-green' : 'badge-yellow'}`}>
                  {session?.patientJoined ? 'Yes' : 'Waiting'}
                </span>
              </div>
            </div>
          </div>

          {/* Video */}
          {meetingUrl && session?.status === 'active' && (
            <div>
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
                  title="Consultation Room"
                />
              </div>
              <div className="alert alert-info" style={{ marginTop: '12px' }}>
                ℹ When you end the session, the patient will be notified automatically.
              </div>
            </div>
          )}

          {session?.status === 'ended' && (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <p className="card-title">Session Completed</p>
              <p className="card-sub" style={{ margin: '8px 0 20px' }}>
                Consultation has ended. Notifications have been sent to the patient.
              </p>
              <button className="btn btn-secondary" onClick={() => navigate('/doctor/consultations')}>
                Back to Consultations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorConsultationRoom;

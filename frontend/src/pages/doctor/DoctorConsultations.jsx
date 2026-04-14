import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getMySessions } from '../../api/telemedicineApi';

function DoctorConsultations() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getMySessions()
      .then((r) => setSessions(r.data.data || []))
      .catch(() => setError('Failed to load consultations.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = sessions.filter((s) => {
    if (filter === 'all')       return true;
    if (filter === 'upcoming')  return ['scheduled', 'active'].includes(s.status);
    if (filter === 'completed') return s.status === 'completed';
    return true;
  });

  const statusBadge = (s) => {
    if (s === 'active')    return <span className="badge badge-green">Active</span>;
    if (s === 'completed') return <span className="badge badge-gray">Completed</span>;
    if (s === 'cancelled') return <span className="badge badge-red">Cancelled</span>;
    return <span className="badge badge-yellow">Scheduled</span>;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>🎥 My Consultations</h1>
          <p>Manage and join your telemedicine sessions</p>
        </div>

        <div className="filter-bar">
          {[
            { key: 'all',       label: 'All Sessions' },
            { key: 'upcoming',  label: '⏳ Upcoming' },
            { key: 'completed', label: '✓ Completed' },
          ].map((f) => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        {loading ? (
          <div className="loading"><span className="spinner" /><span>Loading sessions...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No consultations found.</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s._id} className="consult-card">
              <div className="consult-info">
                <h3>Patient: {s.patientName || 'Patient'}</h3>
                <p>
                  Appointment: {s.appointmentId} · {formatDate(s.scheduledAt || s.createdAt)}
                </p>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {statusBadge(s.status)}
                  {s.doctorJoined  && <span className="badge badge-blue">Doctor Joined</span>}
                  {s.patientJoined && <span className="badge badge-green">Patient Joined</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {['scheduled', 'active'].includes(s.status) && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => navigate(`/doctor/consultation/${s.appointmentId}`)}
                  >
                    🎥 Join
                  </button>
                )}
                {s.status === 'completed' && (
                  <span className="text-muted" style={{ fontSize: '13px', alignSelf: 'center' }}>Ended</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DoctorConsultations;

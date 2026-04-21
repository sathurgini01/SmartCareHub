import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiVideo } from 'react-icons/fi';
import { getPatientTelemedicineHistory } from '../../services/telemedicineService';
import { getSpecialtyIcon, getStatusBadge } from '../../utils/formatters';

const formatSimpleDate = (value) => {
  if (!value) return 'Date not available';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatSimpleTime = (value) => {
  if (!value) return 'Time not available';
  const [start, end] = String(value).split(' - ');
  const formatOne = (time) => {
    if (!time || !time.includes(':')) return time || '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour = hours % 12 || 12;
    return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
  };
  return end ? `${formatOne(start)} - ${formatOne(end)}` : formatOne(start);
};

function PatientTelemedicineHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientTelemedicineHistory()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="appointments my-appointments">
      <div
        className="page-header animate-slideUp"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Telemedicine Sessions</h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            View your online consultation history and open available sessions.
          </p>
        </div>
        <Link to="/appointments" className="btn btn-secondary">
          Appointment History
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '12px', fontWeight: 800, color: '#94a3b8' }}>
            TM
          </div>
          <h3>No telemedicine sessions</h3>
          <p>Accepted online appointments and completed calls will appear here.</p>
          <Link to="/appointments" className="btn btn-primary" style={{ marginTop: '16px' }}>
            View Appointments
          </Link>
        </div>
      ) : (
        <div className="appointments-list stagger-children">
          {sessions.map((session) => (
            <article key={session.id} className="appointment-card card animate-fadeIn telemedicine-history-card">
              <div className="apt-card-left">
                <div className="apt-date-block" style={{ background: 'linear-gradient(135deg, #2563eb, #38bdf8)' }}>
                  <span className="apt-date-day">
                    {session.appointment?.date ? new Date(session.appointment.date).getDate() : '--'}
                  </span>
                  <span className="apt-date-month">
                    {session.appointment?.date
                      ? new Date(session.appointment.date).toLocaleString('default', { month: 'short' })
                      : 'Date'}
                  </span>
                </div>
              </div>

              <div className="apt-card-content">
                <div className="apt-card-top">
                  <div>
                    <h3>{session.doctor?.name || 'Doctor consultation'}</h3>
                    <p className="apt-specialty">
                      {getSpecialtyIcon(session.appointment?.specialty)} {session.appointment?.specialty || 'General Medicine'}
                    </p>
                  </div>
                  <div className="apt-badges">
                    <span className={`badge ${getStatusBadge(session.status === 'completed' ? 'completed' : session.appointment?.status)}`}>
                      {session.status === 'completed' ? 'completed' : session.appointment?.status || 'scheduled'}
                    </span>
                    <span className="badge badge-confirmed">Telemedicine</span>
                  </div>
                </div>

                <div className="apt-card-details">
                  <span><FiCalendar size={13} color="#fff" /> {formatSimpleDate(session.appointment?.date)}</span>
                  <span><FiClock size={13} color="#fff" /> {formatSimpleTime(session.appointment?.time)}</span>
                  <span>{session.appointment?.appointmentNumber || session.appointmentId || 'Online consultation'}</span>
                </div>

                <p className="apt-reason">Doctor: {session.doctor?.hospital || 'SmartCareHub Virtual Clinic'}</p>
                {session.patient?.symptomSummary && <p className="apt-reason">Reason: {session.patient.symptomSummary}</p>}
                {session.endedAt && <p className="apt-ref">Ended: {new Date(session.endedAt).toLocaleString()}</p>}

                <div className="apt-card-actions">
                  <Link
                    to={`/patient/telemedicine/${session.appointmentId}`}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 14px rgba(34,197,94,0.25)' }}
                  >
                    <FiVideo /> Open Session
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientTelemedicineHistory;

import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiVideo } from 'react-icons/fi';
import EmptyState from '../common/EmptyState';
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

export default function TelemedicinePanel({ sessions }) {
  if (!sessions.length) {
    return (
      <div className="card">
        <EmptyState
          title="No telemedicine sessions"
          text="Accepted online appointments and completed calls will appear here."
        />
      </div>
    );
  }

  return (
    <div className="appointments-list stagger-children">
      {sessions.map((session) => (
        <article key={session.id} className="appointment-card card animate-fadeIn telemedicine-history-card">
          <div className="apt-card-left">
            <div className="apt-date-block" style={{ background: 'linear-gradient(135deg, #2563eb, #38bdf8)' }}>
              <span className="apt-date-day">
                {session.date ? new Date(session.date).getDate() : '--'}
              </span>
              <span className="apt-date-month">
                {session.date ? new Date(session.date).toLocaleString('default', { month: 'short' }) : 'Date'}
              </span>
            </div>
          </div>

          <div className="apt-card-content">
            <div className="apt-card-top">
              <div>
                <h3>{session.patientName || 'Patient consultation'}</h3>
                <p className="apt-specialty">
                  {getSpecialtyIcon(session.specialty)} {session.specialty || 'General Medicine'}
                </p>
              </div>
              <div className="apt-badges">
                <span className={`badge ${getStatusBadge(session.status?.toLowerCase() === 'completed' ? 'completed' : session.appointmentStatus)}`}>
                  {session.status || session.appointmentStatus || 'scheduled'}
                </span>
                <span className="badge badge-confirmed">Telemedicine</span>
              </div>
            </div>

            <div className="apt-card-details">
              <span><FiCalendar size={13} color="#fff" /> {formatSimpleDate(session.date)}</span>
              <span><FiClock size={13} color="#fff" /> {formatSimpleTime(session.time)}</span>
              <span>{session.appointmentNumber || session.appointmentId || 'Online consultation'}</span>
            </div>

            {session.patientId && <p className="apt-reason">Patient ID: {session.patientId}</p>}
            {session.quickNotes && <p className="apt-reason">Reason: {session.quickNotes}</p>}

            <div className="apt-card-actions">
              <Link
                to={`/doctor/telemedicine/${session.appointmentId}`}
                className="btn btn-primary btn-sm"
              >
                <FiVideo /> Open Session
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

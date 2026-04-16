import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

export default function TelemedicinePanel({ sessions, onAction }) {
  if (!sessions.length) {
    return (
      <div className="card">
        <EmptyState
          title="No telemedicine sessions"
          text="Create a session from the doctor dashboard to simulate online consultations."
        />
      </div>
    );
  }

  return (
    <div className="telemedicine-grid">
      {sessions.map((session) => (
        <article key={session.id} className="card telemedicine-card">
          <div className="telemedicine-stage">
            <div>
              <p className="topbar-kicker">Video Consultation</p>
              <h3>{session.patientName}</h3>
              <p>{session.appointmentInfo}</p>
            </div>
            <Badge status={session.status.toLowerCase()} />
          </div>

          <div className="telemedicine-video">
            <div className="video-screen">
              <span>{session.provider}</span>
              <strong>Consultation Preview</strong>
            </div>
            <aside className="telemedicine-sidebar">
              <h4>Quick Summary</h4>
              <p>{session.quickNotes}</p>
            </aside>
          </div>

          <div className="button-row">
            <button className="btn btn-secondary" onClick={() => onAction('create')}>
              Create Session
            </button>
            <button className="btn btn-primary" onClick={() => onAction('join', session.id)}>
              Join Session
            </button>
            <button className="btn btn-secondary" onClick={() => onAction('end', session.id)}>
              End Session
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

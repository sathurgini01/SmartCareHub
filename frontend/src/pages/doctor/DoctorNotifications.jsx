import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getMyNotifications } from '../../api/notificationApi';

function DoctorNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter]   = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    // backend requires ?userId=xxx
    getMyNotifications(user?.id)
      .then((r) => setNotifications(r.data.data || []))
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return (n.type || '').toLowerCase() === filter;
  });

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div className="page-hero">
            <div className="page-hero-icon">🔔</div>
            <div className="page-hero-content">
              <h1>Notifications</h1>
              <p>Appointment requests and consultation alerts for your patients.</p>
              <div className="page-hero-badge">
                <span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#60a5fa',display:'inline-block'}}/>
                Real-time updates
              </div>
            </div>
          </div>

          {/* Filter bar removed as requested */}

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="card">
            {loading ? (
              <div className="loading"><span className="spinner" /><span>Loading...</span></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔕</div>
                <p>No notifications found.</p>
              </div>
            ) : (
              filtered.map((n, i) => {
                return (
                  <div key={n._id || i} className="notif-item" style={{ borderLeft: '3px solid #10b981', marginBottom: '10px', padding: '15px' }}>
                    <div className="notif-body">
                      <p className="notif-title" style={{ fontWeight: '600', color: '#f1f5f9' }}>
                        {n.title || n.subject || 'Patient Notification'}
                      </p>
                      <p className="notif-message" style={{ margin: '5px 0', color: '#94a3b8' }}>
                        {n.message}
                      </p>
                      <p className="notif-meta" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorNotifications;

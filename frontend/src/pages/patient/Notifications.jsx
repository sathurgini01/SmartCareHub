import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getMyNotifications } from '../../api/notificationApi';

function Notifications() {
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
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div className="page-header">
            <h1>🔔 Notifications</h1>
            <p>Appointment confirmations, reminders, and consultation alerts</p>
          </div>

          <div className="filter-bar">
            {['all', 'email', 'sms'].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'email' ? '📧 Email' : '📱 SMS'}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="card">
            {loading ? (
              <div className="loading"><span className="spinner" /><span>Loading notifications...</span></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔕</div>
                <p>No notifications found.</p>
              </div>
            ) : (
              filtered.map((n, i) => {
                const ch = (n.type || 'email').toLowerCase();
                const delivered = n.status === 'sent' || n.status === 'delivered';
                return (
                  <div key={n._id || i} className="notif-item">
                    <div className={`notif-icon ${ch}`}>
                      {ch === 'sms' ? '📱' : '📧'}
                    </div>
                    <div className="notif-body">
                      <p className="notif-title">{n.subject || n.message?.substring(0, 60) || 'Notification'}</p>
                      <p className="notif-meta">
                        {n.recipientEmail || n.recipientPhone || ''}{n.recipientEmail || n.recipientPhone ? ' · ' : ''}
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    <span className={`badge ${delivered ? 'badge-green' : 'badge-red'}`}>
                      {delivered ? '✓ Delivered' : '✗ Failed'}
                    </span>
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

export default Notifications;

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAdminLogs } from '../../api/notificationApi';

function AdminNotificationLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    getAdminLogs()
      .then((r) => setLogs(r.data.data || []))
      .catch(() => setError('Failed to load notification logs.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    const matchFilter = filter === 'all' || (l.type || l.channel || '').toLowerCase() === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.recipientEmail?.toLowerCase().includes(q) ||
      l.recipientPhone?.toLowerCase().includes(q) ||
      l.subject?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const stats = {
    total:    logs.length,
    email:    logs.filter((l) => (l.type || l.channel || '').toLowerCase() === 'email').length,
    sms:      logs.filter((l) => (l.type || l.channel || '').toLowerCase() === 'sms').length,
    failed:   logs.filter((l) => l.status === 'failed').length,
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>📨 Notification Logs</h1>
          <p>SMS and email delivery records across all users</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-info"><h3>{stats.total}</h3><p>Total Sent</p></div></div>
          <div className="stat-card"><div className="stat-icon">📧</div><div className="stat-info"><h3>{stats.email}</h3><p>Email</p></div></div>
          <div className="stat-card"><div className="stat-icon">📱</div><div className="stat-info"><h3>{stats.sms}</h3><p>SMS</p></div></div>
          <div className="stat-card"><div className="stat-icon">❌</div><div className="stat-info"><h3>{stats.failed}</h3><p>Failed</p></div></div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            {['all', 'email', 'sms'].map((f) => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'email' ? '📧 Email' : '📱 SMS'}
              </button>
            ))}
          </div>
          <input
            className="form-input"
            placeholder="Search by recipient or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '300px', marginBottom: 0 }}
          />
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <div className="table-wrap">
          {loading ? (
            <div className="loading"><span className="spinner" /><span>Loading logs...</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No notifications found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Subject / Message</th>
                  <th>Status</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => {
                  const ch = (l.type || l.channel || 'email').toLowerCase();
                  const delivered = l.status === 'sent' || l.status === 'delivered';
                  return (
                    <tr key={l._id || i}>
                      <td>
                        <span className={`badge ${ch === 'email' ? 'badge-blue' : 'badge-green'}`}>
                          {ch === 'email' ? '📧 Email' : '📱 SMS'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{l.recipientEmail || l.recipientPhone || '—'}</td>
                      <td style={{ fontSize: '13px', maxWidth: '260px' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {l.subject || l.message?.substring(0, 60) || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${delivered ? 'badge-green' : 'badge-red'}`}>
                          {delivered ? '✓ Delivered' : '✗ Failed'}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '13px' }}>{fmt(l.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNotificationLogs;

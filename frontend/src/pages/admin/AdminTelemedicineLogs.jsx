import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAdminLogs } from '../../api/telemedicineApi';

function AdminTelemedicineLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    getAdminLogs()
      .then((r) => setLogs(r.data.data || []))
      .catch(() => setError('Failed to load telemedicine logs.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return !q ||
      l.appointmentId?.toLowerCase().includes(q) ||
      l.patientName?.toLowerCase().includes(q) ||
      l.doctorName?.toLowerCase().includes(q);
  });

  const statusBadge = (s) => {
    if (s === 'active')    return <span className="badge badge-green">Active</span>;
    if (s === 'completed') return <span className="badge badge-gray">Completed</span>;
    if (s === 'cancelled') return <span className="badge badge-red">Cancelled</span>;
    return <span className="badge badge-yellow">Scheduled</span>;
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  const stats = {
    total:     logs.length,
    active:    logs.filter((l) => l.status === 'active').length,
    completed: logs.filter((l) => l.status === 'completed').length,
    cancelled: logs.filter((l) => l.status === 'cancelled').length,
  };

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>🎥 Telemedicine Logs</h1>
          <p>All video consultation session records</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-info"><h3>{stats.total}</h3><p>Total Sessions</p></div></div>
          <div className="stat-card"><div className="stat-icon">🟢</div><div className="stat-info"><h3>{stats.active}</h3><p>Active Now</p></div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-info"><h3>{stats.completed}</h3><p>Completed</p></div></div>
          <div className="stat-card"><div className="stat-icon">❌</div><div className="stat-info"><h3>{stats.cancelled}</h3><p>Cancelled</p></div></div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <input
            className="form-input"
            placeholder="Search by appointment ID, patient, or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <div className="table-wrap">
          {loading ? (
            <div className="loading"><span className="spinner" /><span>Loading logs...</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No sessions found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Doctor Joined</th>
                  <th>Patient Joined</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{l.appointmentId}</td>
                    <td>{l.doctorName || '—'}</td>
                    <td>{l.patientName || '—'}</td>
                    <td>{statusBadge(l.status)}</td>
                    <td><span className={`badge ${l.doctorJoined ? 'badge-green' : 'badge-gray'}`}>{l.doctorJoined ? 'Yes' : 'No'}</span></td>
                    <td><span className={`badge ${l.patientJoined ? 'badge-green' : 'badge-gray'}`}>{l.patientJoined ? 'Yes' : 'No'}</span></td>
                    <td className="text-muted" style={{ fontSize: '13px' }}>{fmt(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTelemedicineLogs;

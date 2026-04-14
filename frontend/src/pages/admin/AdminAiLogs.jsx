import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getAdminLogs } from '../../api/aiSymptomApi';

function AdminAiLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    getAdminLogs()
      .then((r) => setLogs(r.data.data || []))
      .catch(() => setError('Failed to load AI logs.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    const matchRisk = riskFilter === 'all' || (l.riskLevel || '').toLowerCase() === riskFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.patientName?.toLowerCase().includes(q) ||
      l.symptoms?.toLowerCase().includes(q) ||
      l.recommendedSpecialty?.toLowerCase().includes(q);
    return matchRisk && matchSearch;
  });

  const stats = {
    total:  logs.length,
    high:   logs.filter((l) => l.riskLevel?.toLowerCase() === 'high').length,
    medium: logs.filter((l) => l.riskLevel?.toLowerCase() === 'medium').length,
    low:    logs.filter((l) => l.riskLevel?.toLowerCase() === 'low').length,
  };

  const riskClass = (r) => {
    const v = (r || '').toLowerCase();
    if (v === 'high')   return 'badge-red';
    if (v === 'medium') return 'badge-yellow';
    return 'badge-green';
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>🧠 AI Symptom Logs</h1>
          <p>All patient symptom checker queries and AI analysis results</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-info"><h3>{stats.total}</h3><p>Total Queries</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--danger-light)' }}>🔴</div><div className="stat-info"><h3>{stats.high}</h3><p>High Risk</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--warning-light)' }}>🟡</div><div className="stat-info"><h3>{stats.medium}</h3><p>Medium Risk</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: 'var(--success-light)' }}>🟢</div><div className="stat-info"><h3>{stats.low}</h3><p>Low Risk</p></div></div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            {['all', 'high', 'medium', 'low'].map((r) => (
              <button key={r} className={`filter-btn ${riskFilter === r ? 'active' : ''}`} onClick={() => setRiskFilter(r)}>
                {r === 'all' ? 'All Risk Levels' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <input
            className="form-input"
            placeholder="Search by patient, symptom, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '300px', marginBottom: 0 }}
          />
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <div className="table-wrap">
          {loading ? (
            <div className="loading"><span className="spinner" /><span>Loading AI logs...</span></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧬</div>
              <p>No AI queries found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Symptoms</th>
                  <th>Recommended Specialty</th>
                  <th>Risk Level</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={l._id || i}>
                    <td style={{ fontWeight: 600 }}>{l.patientName || l.patientId || '—'}</td>
                    <td style={{ fontSize: '13px', maxWidth: '240px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.symptoms || '—'}
                      </span>
                    </td>
                    <td>
                      {l.recommendedSpecialty
                        ? <span className="specialty-tag" style={{ fontSize: '12px', padding: '3px 10px' }}>{l.recommendedSpecialty}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${riskClass(l.riskLevel)}`}>
                        {l.riskLevel || 'N/A'}
                      </span>
                    </td>
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

export default AdminAiLogs;

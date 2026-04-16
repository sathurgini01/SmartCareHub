import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchPrescriptions();
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/api/patients/prescriptions');
      setPrescriptions(res.data);
    } catch {
      setError('Failed to load prescriptions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="prescriptions">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h1 style={{ margin: 0 }}>Prescriptions</h1>
        <span
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '20px',
            padding: '4px 14px',
            color: '#94a3b8',
            fontSize: '0.9rem',
          }}
        >
          {prescriptions.length} record{prescriptions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        {prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💊</div>
            <h3 style={{ color: '#94a3b8', margin: '0 0 8px' }}>
              No prescriptions yet
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Prescriptions issued by your doctor will appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Instructions</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx, idx) => (
                  <tr key={rx._id || idx}>
                    <td>{idx + 1}</td>
                    <td>{rx.doctorName || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{rx.medication}</td>
                    <td>{rx.dosage || '—'}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'pre-wrap' }}>
                      {rx.instructions || '—'}
                    </td>
                    <td>{new Date(rx.issuedDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={
                          rx.status === 'active'
                            ? 'badge-green'
                            : rx.status === 'expired'
                            ? 'badge-red'
                            : 'badge-yellow'
                        }
                      >
                        {rx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;

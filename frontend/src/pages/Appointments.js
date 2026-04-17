import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_CLASS = {
  confirmed: 'badge-green',
  pending: 'badge-yellow',
  cancelled: 'badge-red',
  completed: 'badge-green',
};

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/api/patients/appointments');
      setAppointments(res.data);
    } catch {
      setError('Failed to load appointments. Please try again later.');
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
    <div className="appointments">
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
        <h1 style={{ margin: 0 }}>Appointments</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            {appointments.length} record{appointments.length !== 1 ? 's' : ''}
          </span>
          <Link to="/my-appointments" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', background: '#dc2626', color: '#fff', textDecoration: 'none' }}>
            Make Appointment
          </Link>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
            <h3 style={{ color: '#94a3b8', margin: '0 0 8px' }}>
              No appointments yet
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Appointments booked through the Appointment Service will appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, idx) => (
                  <tr key={appt._id || appt.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{appt.doctorName || '—'}</td>
                    <td>{new Date(appt.date).toLocaleDateString()}</td>
                    <td>{appt.time || '—'}</td>
                    <td>{appt.purpose || '—'}</td>
                    <td>
                      <span
                        className={STATUS_CLASS[appt.status] || 'badge-yellow'}
                      >
                        {appt.status}
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

export default Appointments;

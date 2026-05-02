import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPrescriptions } from '../api/patientApi';
import { FiFileText, FiDownload, FiCalendar, FiUser, FiInfo, FiActivity } from 'react-icons/fi';
import './MyAppointments.css';

const mockData = [
  { id: 1, date: '2024-04-01', doctor: 'Dr. Smith', medicine: 'Amoxicillin 500mg (1x3 for 5 days)', diagnosis: 'Bacterial Infection', status: 'Active' },
  { id: 2, date: '2024-03-15', doctor: 'Dr. Lee', medicine: 'Ibuprofen 400mg (SOS)', diagnosis: 'Muscle Spasm', status: 'Completed' },
  { id: 3, date: '2024-01-10', doctor: 'Dr. Emily Chen', medicine: 'Lisinopril 10mg (1x1 daily)', diagnosis: 'Hypertension', status: 'Active' }
];

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPrescriptions()
      .then(res => setPrescriptions(res.data.data || res.data))
      .catch(() => setPrescriptions(mockData))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="my-appointments page-wrapper">
      <div className="container">
        <div className="page-header animate-slideUp">
          <div>
            <h1>My Prescriptions</h1>
            <p>View and manage your medical prescriptions and doctor's notes</p>
          </div>
        </div>

        {loading ? (
          <div className="spinner-overlay"><div className="spinner"></div></div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state animate-fadeIn">
            <FiFileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3>No Prescriptions Found</h3>
            <p>You do not have any active or past prescriptions on record.</p>
            <Link to="/appointments" className="btn btn-primary" style={{ marginTop: '16px' }}>View Appointments</Link>
          </div>
        ) : (
          <div className="appointments-list stagger-children">
            {prescriptions.map((p) => (
              <div key={p.id || p._id} className="appointment-card card animate-fadeIn">
                <div className="apt-card-left" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                  <div className="apt-date-block" style={{ color: '#fff' }}>
                    <FiFileText size={32} />
                  </div>
                </div>

                <div className="apt-card-content">
                  <div className="apt-card-top">
                    <div>
                      <h3>{p.doctor || p.doctorName || 'Unknown Doctor'}</h3>
                      <p className="apt-specialty">
                        <FiCalendar style={{ marginRight: '6px' }} /> {p.date || new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="apt-badges">
                      <span className={`badge badge-${p.status === 'Active' ? 'success' : 'warning'}`}>
                        {p.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="apt-card-details" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <FiActivity style={{ color: 'var(--primary)', marginTop: '4px' }} />
                      <div>
                        <strong>Diagnosis / Notes</strong>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>{p.diagnosis || p.notes || 'Routine checkup and diagnosis.'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px' }}>
                      <FiInfo style={{ color: 'var(--primary)', marginTop: '4px' }} />
                      <div>
                        <strong>Prescribed Medication</strong>
                        <div style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                          {p.medicines && p.medicines.length > 0 ? (
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                              {p.medicines.map((m, idx) => (
                                <li key={idx}>
                                  <strong>{m.name}</strong> {m.dosage} - {m.frequency} ({m.duration})
                                  {m.instructions && <div style={{ fontSize: '12px', fontStyle: 'italic' }}>Note: {m.instructions}</div>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ margin: 0 }}>{p.medicine || 'No specific medications listed'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="apt-card-actions" style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    <Link to="/appointments" className="btn btn-secondary btn-sm">
                      <FiUser /> View Appointment
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;

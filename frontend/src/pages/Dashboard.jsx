import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return (
    <div style={{ maxWidth: 900, margin: '40px auto' }}>
      <h2 style={{ color: '#fff' }}>Dashboard</h2>
      <p style={{ color: '#fff' }}>Welcome, {user?.name || 'Patient'}!</p>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
        <div className="stat-card card">
          <div className="stat-title">Reports</div>
          <div className="stat-value">3</div>
        </div>
        <div className="stat-card card">
          <div className="stat-title">Prescriptions</div>
          <div className="stat-value">2</div>
        </div>
        <div className="stat-card card">
          <div className="stat-title">Profile Status</div>
          <div className="stat-value badge-green">Active</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link className="btn btn-primary" to="/patient/symptom-checker">AI Symptom Checker</Link>
        <Link className="btn btn-primary" to="/profile">Profile</Link>
        <Link className="btn btn-primary" to="/upload-report">Upload Report</Link>
        <Link className="btn btn-primary" to="/prescriptions">Prescriptions</Link>
      </div>
      <div
        className="stats-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '2rem 0' }}
      >
        <Link className="card" to="/patient/symptom-checker" style={{ padding: '1.25rem', textDecoration: 'none', color: '#fff' }}>
          <h3>AI Symptom Checker</h3>
          <p>Analyze symptoms and get guidance from the patient dashboard.</p>
        </Link>
        <Link className="card" to="/patient/notifications" style={{ padding: '1.25rem', textDecoration: 'none', color: '#fff' }}>
          <h3>Notifications</h3>
          <p>Open your reminders and system alerts quickly.</p>
        </Link>
        <Link className="card" to="/appointments" style={{ padding: '1.25rem', textDecoration: 'none', color: '#fff' }}>
          <h3>Telemedicine Consultation</h3>
          <p>Open appointments and join your active telemedicine consultation from there.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

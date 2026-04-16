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
        <Link className="btn btn-primary" to="/profile">Profile</Link>
        <Link className="btn btn-primary" to="/upload-report">Upload Report</Link>
        <Link className="btn btn-primary" to="/prescriptions">Prescriptions</Link>
      </div>
    </div>
  );
};

export default Dashboard;

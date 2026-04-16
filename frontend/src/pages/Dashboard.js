import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    totalPrescriptions: 0,
    upcomingAppointments: 0,
    profileStatus: 'Incomplete',
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, prescriptionsRes] = await Promise.allSettled([
        api.get('/api/patients/reports'),
        api.get('/api/patients/prescriptions'),
      ]);

      const reports =
        reportsRes.status === 'fulfilled' ? reportsRes.value.data : [];
      const prescriptions =
        prescriptionsRes.status === 'fulfilled'
          ? prescriptionsRes.value.data
          : [];

      setStats({
        totalReports: reports.length,
        totalPrescriptions: prescriptions.length,
        upcomingAppointments: 0,
        profileStatus: 'Active',
      });

      // Show 3 most recent reports
      setRecentReports(reports.slice(-3).reverse());
    } catch (error) {
      console.error('Dashboard fetch error:', error);
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
    <div className="dashboard">
      {/* Welcome banner */}
      <div className="welcome-banner card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderLeft: '4px solid #dc2626' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>
          Welcome back, <span style={{ color: '#dc2626' }}>{user?.name}</span>
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '6px' }}>
          Here is a summary of your healthcare activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card card" style={{ borderTop: '3px solid #dc2626' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
          <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 8px' }}>
            Medical Reports
          </h3>
          <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#f1f5f9' }}>
            {stats.totalReports}
          </h2>
          <Link
            to="/upload-report"
            style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '8px', display: 'block' }}
          >
            Upload new report →
          </Link>
        </div>

        <div className="stat-card card" style={{ borderTop: '3px solid #10b981' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💊</div>
          <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 8px' }}>
            Prescriptions
          </h3>
          <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#f1f5f9' }}>
            {stats.totalPrescriptions}
          </h2>
          <Link
            to="/prescriptions"
            style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '8px', display: 'block' }}
          >
            View all prescriptions →
          </Link>
        </div>

        <div className="stat-card card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
          <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 8px' }}>
            Appointments
          </h3>
          <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#f1f5f9' }}>
            {stats.upcomingAppointments}
          </h2>
          <Link
            to="/appointments"
            style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '8px', display: 'block' }}
          >
            View appointments →
          </Link>
        </div>

        <div className="stat-card card" style={{ borderTop: '3px solid #6366f1' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👤</div>
          <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 8px' }}>
            Account Status
          </h3>
          <span className="badge-green" style={{ fontSize: '1rem', padding: '6px 14px' }}>
            {stats.profileStatus}
          </span>
          <Link
            to="/profile"
            style={{ color: '#6366f1', fontSize: '0.85rem', marginTop: '8px', display: 'block' }}
          >
            Manage profile →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#94a3b8' }}>
          QUICK ACTIONS
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-secondary">
            👤 Manage Profile
          </Link>
          <Link to="/upload-report" className="btn btn-primary">
            📤 Upload Report
          </Link>
          <Link to="/prescriptions" className="btn btn-secondary">
            💊 View Prescriptions
          </Link>
          <Link to="/appointments" className="btn btn-secondary">
            📅 My Appointments
          </Link>
        </div>
      </div>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#94a3b8' }}>
            RECENT REPORTS
          </h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Description</th>
                  <th>Uploaded On</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, idx) => (
                  <tr key={idx}>
                    <td>{report.fileName}</td>
                    <td>{report.description || '—'}</td>
                    <td>{new Date(report.uploadedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link
            to="/upload-report"
            style={{ color: '#dc2626', fontSize: '0.9rem', display: 'inline-block', marginTop: '8px' }}
          >
            View all reports →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

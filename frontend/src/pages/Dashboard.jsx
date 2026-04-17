import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ShellLayout from '../components/common/ShellLayout';
import PageBanner from '../components/common/PageBanner';
import StatCard from '../components/common/StatCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    totalPrescriptions: 0,
    upcomingAppointments: 0,
    profileStatus: 'Active',
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, prescriptionsRes, appointmentsRes] = await Promise.allSettled([
        api.get('/patients/reports'),
        api.get('/patients/prescriptions'),
        api.get('/appointments/my-appointments'),
      ]);

      const reports = reportsRes.status === 'fulfilled' ? reportsRes.value.data.data || reportsRes.value.data : [];
      const prescriptions = prescriptionsRes.status === 'fulfilled' ? prescriptionsRes.value.data.data || prescriptionsRes.value.data : [];
      const appointments = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data.data || appointmentsRes.value.data : [];

      setStats({
        totalReports: reports.length,
        totalPrescriptions: prescriptions.length,
        upcomingAppointments: appointments.filter(a => a.status !== 'cancelled').length,
        profileStatus: 'Active',
      });

      setRecentReports(reports.slice(0, 3));
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShellLayout>
      <PageBanner 
        eyebrow="Smart Healthcare Patient Portal"
        title={`Welcome back, ${user?.name || 'User'}`}
        subtitle="Manage your health records, prescriptions, and appointments in one place."
      />

      <div className="stats-grid stats-grid-compact">
        <StatCard title="Medical Reports" value={stats.totalReports} icon="📄" />
        <StatCard title="Prescriptions" value={stats.totalPrescriptions} icon="💊" />
        <StatCard title="Appointments" value={stats.upcomingAppointments} icon="📅" />
        <StatCard title="Status" value={stats.profileStatus} icon="👤" />
      </div>

      <div className="section-heading" style={{ marginTop: '2rem' }}>
        <h2>Quick Actions</h2>
        <p>Access your healthcare services quickly.</p>
      </div>

      <div className="services-grid services-grid-compact">
        <Link to="/profile" className="service-card service-card-profile">
          <span className="service-icon service-emoji">👤</span>
          <h3>My Profile</h3>
          <p>Update your personal information</p>
        </Link>
        <Link to="/upload-report" className="service-card service-card-reports">
          <span className="service-icon service-emoji">📤</span>
          <h3>Upload Report</h3>
          <p>Share medical records safely</p>
        </Link>
        <Link to="/prescriptions" className="service-card service-card-prescriptions">
          <span className="service-icon service-emoji">💊</span>
          <h3>Prescriptions</h3>
          <p>View your digital medicines</p>
        </Link>
        <Link to="/my-appointments" className="service-card service-card-appointments">
          <span className="service-icon service-emoji">📅</span>
          <h3>My Appointments</h3>
          <p>Manage your bookings</p>
        </Link>
      </div>

      {recentReports.length > 0 && (
        <section className="card compact-card" style={{ marginTop: '2rem' }}>
          <div className="section-heading">
            <h2>Recent Reports</h2>
            <p>Your latest medical record uploads.</p>
          </div>
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
                    <td>{report.fileName || report.originalName}</td>
                    <td>{report.description || 'Medical Report'}</td>
                    <td>{new Date(report.uploadedAt || report.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </ShellLayout>
  );
};

export default Dashboard;

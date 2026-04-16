import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    totalReports: 0,
    upcomingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [prescriptionsRes, reportsRes, appointmentsRes] = await Promise.all([
        api.get('/api/patients/prescriptions'),
        api.get('/api/patients/reports'),
        api.get('/api/patients/appointments')
      ]);

      setStats({
        totalPrescriptions: prescriptionsRes.data.length,
        totalReports: reportsRes.data.length,
        upcomingAppointments: appointmentsRes.data.filter(appt => new Date(appt.date) > new Date()).length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Prescriptions</h3>
          <h2>{stats.totalPrescriptions}</h2>
        </div>
        <div className="stat-card">
          <h3>Medical Reports</h3>
          <h2>{stats.totalReports}</h2>
        </div>
        <div className="stat-card">
          <h3>Upcoming Appointments</h3>
          <h2>{stats.upcomingAppointments}</h2>
        </div>
      </div>
      <div className="card">
        <h2>Welcome back, {user?.name}!</h2>
        <p>Here's a quick overview of your healthcare activities.</p>
      </div>
    </div>
  );
};

export default Dashboard;
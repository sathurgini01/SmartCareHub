import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="App">
      <div className="sidebar">
        <div className="logo">
          <h3>SmartCareHub</h3>
        </div>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/prescriptions">Prescriptions</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/upload-report">Upload Report</Link>

          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </nav>
      </div>

      <div className="main-content">
        <div className="navbar">
          <h2>Welcome, {user?.name}</h2>
          <span className="badge-green">Patient</span>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
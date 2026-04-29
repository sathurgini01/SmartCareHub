import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const patientCoreLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/appointments', label: 'Book Appointment' },
    { to: '/payment-history', label: 'Payment History' },
    { to: '/patient/symptom-checker', label: 'AI Symptom Checker' },
    { to: '/patient/notifications', label: 'Notifications' },
  ];

  const doctorCoreLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Doctor Appointments' },
    { to: '/doctor/notifications', label: 'Doctor Notifications' },
  ];

  const adminCoreLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard' },
    { to: '/admin/telemedicine/logs', label: 'Telemedicine Logs' },
    { to: '/admin/notifications/logs', label: 'Notification Logs' },
    { to: '/admin/ai/logs', label: 'AI Logs' },
  ];

  const getLinks = () => {
    if (!token || !user) return [];
    if (user.role === 'doctor') return doctorCoreLinks;
    if (user.role === 'admin') return adminCoreLinks;
    return patientCoreLinks;
  };

  const links = getLinks();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="brand-logo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 10h3l2-5 4 10 2-5h5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        Smart<span>Care</span>Hub
      </Link>

      <div className="navbar-links">
        {token && links.map((l) => (
          <Link key={l.to} to={l.to} className={isActive(l.to)}>
            {l.label}
          </Link>
        ))}
        {!token && (
           <>
             <Link to="/login" className={isActive('/login')}>Login</Link>
             <Link to="/register" className={isActive('/register')}>Register</Link>
           </>
        )}
      </div>

      <div className="nav-user">
        {token && user && (
          <>
            <span className="nav-role-badge">{user.role}</span>
            <span className="welcome-text" style={{ marginRight: '1rem', color: '#888' }}>
              {user.name || user.email}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

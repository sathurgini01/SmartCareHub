import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiCalendar, FiCreditCard, FiHome, FiShield } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <FiHome /> },
    { path: '/doctors', label: 'Find Doctors', icon: <FiUser /> },
  ];

  if (isAuthenticated) {
    navLinks.push(
      { path: '/appointments', label: 'My Appointments', icon: <FiCalendar /> },
      { path: '/payments', label: 'Payments', icon: <FiCreditCard /> }
    );
  }

  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Admin', icon: <FiShield /> });
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <span className="logo-icon">⚕️</span>
            <div>
              <span className="logo-text">MediBook</span>
              <span className="logo-sub">Healthcare</span>
            </div>
          </div>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="nav-user-section">
              <div className="nav-user-info">
                <div className="nav-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div className="nav-user-details">
                  <span className="nav-user-name">{user?.name}</span>
                  <span className="nav-user-role">{user?.role}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
              Get Started
            </Link>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

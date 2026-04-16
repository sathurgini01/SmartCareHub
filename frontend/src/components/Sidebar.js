import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ children, className = '', ...props }) => {
  const location = useLocation();

  return (
    <div className={`sidebar ${className}`} {...props}>
      <div className="logo">
        <h3>SmartCareHub</h3>
      </div>
      <nav>
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
          Profile
        </Link>
        <Link to="/prescriptions" className={location.pathname === '/prescriptions' ? 'active' : ''}>
          Prescriptions
        </Link>
        <Link to="/appointments" className={location.pathname === '/appointments' ? 'active' : ''}>
          Appointments
        </Link>
        <Link to="/upload-report" className={location.pathname === '/upload-report' ? 'active' : ''}>
          Upload Report
        </Link>
        {children}
      </nav>
    </div>
  );
};

export default Sidebar;
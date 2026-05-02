import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AppIcon({ type }) {
  const commonProps = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };

  if (type === 'logout') {
    return (
      <svg {...commonProps}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    );
  }

  if (type === 'user') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    );
  }

  if (type === 'home') {
    return (
      <svg {...commonProps}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }

  if (type === 'bell') {
    return (
      <svg {...commonProps}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function ShellLayout({ children }) {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const profilePath =
    user?.role === 'doctor'
      ? '/doctor/profile'
      : user?.role === 'admin'
        ? '/admin/profile'
        : '/profile';

  return (
    <div className="shell-layout">
      <header className="app-navbar card">
        <div className="topbar-left">
          <button className="nav-back nav-back-round" onClick={() => navigate(-1)}>
            <AppIcon type="back" />
          </button>
          <div className="brand-lockup">
            <div className="sidebar-logo">$</div>
            <div>
              <h2>SmartCareHub</h2>
              <p>HEALTHCARE</p>
            </div>
          </div>
        </div>

        <div className="topbar-actions topbar-actions-simple">
          <button className="nav-logout" onClick={() => navigate('/dashboard')} style={{ marginRight: '8px' }}>
            <AppIcon type="home" />
            Home
          </button>
          <button className="nav-logout" onClick={() => navigate('/notifications')} style={{ marginRight: '8px' }}>
            <AppIcon type="bell" />
            Notifications
          </button>
          <button className="profile-trigger" onClick={() => navigate(profilePath)}>
            <span className="profile-icon-circle">
              <AppIcon type="user" />
            </span>
            <span className="profile-trigger-copy">
              <strong>{user?.fullName || user?.name || 'SmartCare user'}</strong>
              <small>{user?.role}</small>
            </span>
          </button>
          <button className="nav-logout" onClick={logoutUser}>
            <AppIcon type="logout" />
            Logout
          </button>
        </div>
      </header>

      <main className="shell-main">{children}</main>
    </div>
  );
}

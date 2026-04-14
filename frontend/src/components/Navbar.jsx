
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/patient/symptom-checker', label: 'Symptom Checker' },
    { to: '/patient/notifications', label: 'Notifications' },
  ];

  const doctorLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/doctor/consultations', label: 'Consultations' },
    { to: '/doctor/notifications', label: 'Notifications' },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin/telemedicine/logs', label: 'Telemedicine' },
    { to: '/admin/notifications/logs', label: 'Notifications' },
    { to: '/admin/ai/logs', label: 'AI Logs' },
  ];

  const links =
    user?.role === 'doctor' ? doctorLinks :
    user?.role === 'admin'  ? adminLinks  :
    patientLinks;

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        Smart<span>Care</span>Hub
      </Link>

      <div className="navbar-links">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={isActive(l.to)}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-user">
        {user && (
          <span className="nav-role-badge">{user.role}</span>
        )}
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

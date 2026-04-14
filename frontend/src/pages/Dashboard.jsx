
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const patientLinks = [
  { to: '/patient/symptom-checker', icon: '🧠', title: 'Symptom Checker', desc: 'AI-powered health assessment' },
  { to: '/patient/notifications',   icon: '🔔', title: 'Notifications',   desc: 'View appointment & session alerts' },
  { to: '/profile',                 icon: '👤', title: 'My Profile',      desc: 'Manage your health profile' },
  { to: '/prescriptions',           icon: '💊', title: 'Prescriptions',   desc: 'View your prescriptions' },
  { to: '/upload-report',           icon: '📎', title: 'Upload Report',   desc: 'Share medical documents' },
];

const doctorLinks = [
  { to: '/doctor/consultations',  icon: '🎥', title: 'My Consultations', desc: 'Upcoming & completed sessions' },
  { to: '/doctor/notifications',  icon: '🔔', title: 'Notifications',    desc: 'Appointment & session alerts' },
  { to: '/profile',               icon: '👤', title: 'My Profile',       desc: 'Manage availability & info' },
];

const adminLinks = [
  { to: '/admin/telemedicine/logs',  icon: '🎥', title: 'Telemedicine Logs',  desc: 'All video session records' },
  { to: '/admin/notifications/logs', icon: '📨', title: 'Notification Logs',  desc: 'SMS & email delivery logs' },
  { to: '/admin/ai/logs',            icon: '🧠', title: 'AI Query Logs',      desc: 'Patient symptom check history' },
];

function Dashboard() {
  const { user } = useAuth();
  const role  = user?.role || 'patient';
  const name  = user?.name || 'User';
  const links = role === 'doctor' ? doctorLinks : role === 'admin' ? adminLinks : patientLinks;

  const greeting = role === 'admin' ? 'Platform Overview' : `Welcome back, ${name}`;
  const sub       = role === 'admin' ? 'Monitor platform activity across all services.' :
                    role === 'doctor' ? 'Manage your consultations and patient interactions.' :
                    'Your health management hub — everything in one place.';

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div className="page-header">
          <h1>{greeting}</h1>
          <p>{sub}</p>
        </div>

        <p className="section-title">Quick Access</p>
        <div className="quick-links">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="quick-link-card">
              <div className="ql-icon">{l.icon}</div>
              <h3>{l.title}</h3>
              <p>{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

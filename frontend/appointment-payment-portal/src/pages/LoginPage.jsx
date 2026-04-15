import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiUser, FiArrowRight, FiShield } from 'react-icons/fi';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, name, role);
    
    if (result.success) {
      navigate(role === 'admin' ? '/admin' : '/doctors');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const quickLogin = async (presetRole) => {
    setLoading(true);
    const presets = {
      patient: { email: 'patient@demo.lk', name: 'Demo Patient' },
      doctor: { email: 'doctor@demo.lk', name: 'Dr. Demo' },
      admin: { email: 'admin@demo.lk', name: 'Admin User' }
    };
    
    const result = await login(presets[presetRole].email, presets[presetRole].name, presetRole);
    if (result.success) {
      navigate(presetRole === 'admin' ? '/admin' : '/doctors');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container animate-scaleIn">
        <div className="login-header">
          <div className="login-icon">⚕️</div>
          <h1>Welcome to MediBook</h1>
          <p>Sign in to book appointments and manage your healthcare</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <FiUser className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'} <FiArrowRight />
          </button>
        </form>

        <div className="login-divider">
          <span>Quick Demo Login</span>
        </div>

        <div className="quick-login-buttons">
          <button onClick={() => quickLogin('patient')} className="btn btn-secondary" disabled={loading}>
            👤 Patient
          </button>
          <button onClick={() => quickLogin('doctor')} className="btn btn-secondary" disabled={loading}>
            🩺 Doctor
          </button>
          <button onClick={() => quickLogin('admin')} className="btn btn-secondary" disabled={loading}>
            <FiShield /> Admin
          </button>
        </div>

        <p className="login-note">
          💡 This is a mock authentication for standalone testing. Will be replaced with Member 1's Auth Service.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

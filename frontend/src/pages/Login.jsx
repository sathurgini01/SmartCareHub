import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(form);
      const role = result?.user?.role || form.role;
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and role.');
    }
  };

  return (
    <div className="centered-container" style={{ padding: '60px 0', background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '3rem', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px', fontSize: '2.2rem', fontWeight: '700' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Enter your credentials to access your account</p>
        
        {error && <div className="alert-error" style={{ marginBottom: '20px', padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Role</label>
            <select 
              className="form-input" 
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: '14px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '10px', fontSize: '1rem' }}
            >
              <option value="patient">Patient / Regular User</option>
              <option value="doctor">Medical Doctor</option>
              <option value="admin">Platform Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="name@example.com" style={{ width: '100%', padding: '14px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '10px', fontSize: '1rem' }} />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" style={{ width: '100%', padding: '14px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '10px', fontSize: '1rem' }} />
          </div>

          <button className="btn btn-primary" type="submit" style={{ width: '100%', height: '54px', fontSize: '1.1rem', fontWeight: '600', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', cursor: 'pointer', transition: 'all 0.3s ease' }}>Sign In</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '20px' }}>
          Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '600' }}>Register here</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

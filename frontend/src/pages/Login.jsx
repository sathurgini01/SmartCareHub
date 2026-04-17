import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const getDashboardPath = (role) => {
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
  if (normalizedRole === 'doctor') return '/doctor/dashboard';
  if (normalizedRole === 'admin') return '/admin/dashboard';
  return '/dashboard';
};

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(form);
      navigate(getDashboardPath(result?.user?.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="centered-container">
      <div className="card" style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
        <h2 style={{ color: '#fff', textAlign: 'center' }}>Login</h2>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required />
          <label className="form-label">Password</label>
          <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} required />
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

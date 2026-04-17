import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const getDashboardPath = (role) => {
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
  if (normalizedRole === 'doctor') return '/doctor/dashboard';
  if (normalizedRole === 'admin') return '/admin/dashboard';
  return '/dashboard';
};

const Register = () => {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const result = await register(form);
      const role = result?.user?.role || form.role;
      setSuccess('Registration successful!');
      setTimeout(() => {
        navigate(getDashboardPath(role), { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="centered-container">
      <div className="card" style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
        <h2 style={{ color: '#fff', textAlign: 'center' }}>Register</h2>
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label">Name</label>
          <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required />
          <label className="form-label">Email</label>
          <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required />
          <label className="form-label">Password</label>
          <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} required />
          <label className="form-label">Role</label>
          <select className="form-input" name="role" value={form.role} onChange={handleChange} required>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;

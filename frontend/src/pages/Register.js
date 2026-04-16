import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'patient',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const pwOk = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password);

    if (!form.name.trim())        e.name            = 'Full name is required.';
    if (!form.email)              e.email           = 'Email is required.';
    else if (!emailOk)            e.email           = 'Enter a valid email address.';
    if (!form.phone.trim())       e.phone           = 'Phone number is required.';
    if (!form.address.trim())     e.address         = 'Address is required.';
    if (!form.password)           e.password        = 'Password is required.';
    else if (!pwOk)               e.password        = 'Min 8 characters with at least one letter and one number.';
    if (!form.confirmPassword)    e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
                                  e.confirmPassword = 'Passwords do not match.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register({
        name:     form.name.trim(),
        email:    form.email.trim(),
        phone:    form.phone.trim(),
        address:  form.address.trim(),
        role:     form.role,
        password: form.password,
      });
      if (result.success) {
        navigate('/dashboard');
      } else {
        setServerError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── shared styles ── */
  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '8px',
    background: '#0a0f1e', border: '1px solid #1e293b',
    color: '#f1f5f9', fontSize: '0.92rem', outline: 'none',
    boxSizing: 'border-box', marginTop: '6px',
  };
  const labelStyle = {
    display: 'block', color: '#94a3b8', fontSize: '0.82rem',
    fontWeight: 600, letterSpacing: '0.04em',
  };
  const errStyle = { color: '#ef4444', fontSize: '0.78rem', marginTop: '4px' };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0f1e', padding: '40px 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: '520px',
        background: '#111827', border: '1px solid #1e293b',
        borderRadius: '20px', padding: '40px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg,#dc2626,#991b1b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', color: '#fff', fontWeight: 900,
          }}>✚</div>
          <h1 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.6rem', fontWeight: 800 }}>Create Account</h1>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Join SmartCareHub — Sri Lanka's Health Portal
          </p>
        </div>

        {serverError && (
          <div style={{
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.35)',
            borderRadius: '8px', padding: '12px 16px', color: '#fca5a5',
            fontSize: '0.88rem', marginBottom: '20px',
          }}>{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Perera"
              autoComplete="name"
              style={inputStyle}
            />
            {errors.name && <p style={errStyle}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              style={inputStyle}
            />
            {errors.email && <p style={errStyle}>{errors.email}</p>}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+94 77 123 4567"
              autoComplete="tel"
              style={inputStyle}
            />
            {errors.phone && <p style={errStyle}>{errors.phone}</p>}
          </div>

          {/* Address */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main Street, Colombo"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            {errors.address && <p style={errStyle}>{errors.address}</p>}
          </div>

          {/* Role */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 chars with letter + number"
              autoComplete="new-password"
              style={inputStyle}
            />
            {errors.password && <p style={errStyle}>{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              style={inputStyle}
            />
            {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#7f1d1d' : 'linear-gradient(135deg,#dc2626,#b91c1c)',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(220,38,38,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '0.88rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#dc2626', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '8px' }}>
          <Link to="/" style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

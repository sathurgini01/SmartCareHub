import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'patient',
    specialization: '',
    licenseNumber: '',
    experience: '',
    hospital: '',
    accessKey: '',
    title: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Debug log to verify data being sent
    console.log('Submitting registration form:', form);

    try {
      // Ensure we send fullName for backend compatibility if needed
      const submitData = { ...form, fullName: form.name };
      const result = await register(submitData);
      const role = result?.user?.role || form.role;
      
      setSuccess('Registration successful!');
      setTimeout(() => {
        if (role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/home');
        }
      }, 1500);
    } catch (err) {
      console.error('Registration error details:', err.response?.data);
      setError(err.response?.data?.message || 'Registration failed. Check if all required fields are filled.');
    }
  };

  return (
    <div className="centered-container" style={{ padding: '40px 0', background: '#0f172a', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: 500, margin: 'auto', padding: '2.5rem', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid #334155' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px', fontSize: '2rem' }}>Create Account</h2>
        
        {error && <div className="alert-error" style={{ marginBottom: '20px', padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px' }}>{error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px' }}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Register As</label>
            <select 
              className="form-input" 
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }}
            >
              <option value="patient">Patient / Regular User</option>
              <option value="doctor">Medical Doctor</option>
              <option value="admin">Platform Admin</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Full Name</label>
              <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
            </div>
            <div>
              <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
          </div>

          {form.role === 'doctor' && (
            <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid #3b82f6' }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🩺</span> Professional Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Specialization</label>
                  <input className="form-input" type="text" name="specialization" value={form.specialization} onChange={handleChange} required placeholder="e.g. Cardiology" style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>License No.</label>
                  <input className="form-input" type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div>
                  <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Experience (Yrs)</label>
                  <input className="form-input" type="number" name="experience" value={form.experience} onChange={handleChange} required style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Hospital / Clinic</label>
                  <input className="form-input" type="text" name="hospital" value={form.hospital} onChange={handleChange} placeholder="Current place of work" style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                </div>
              </div>
            </div>
          )}



          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '30px', height: '50px', fontSize: '1.1rem', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)' }}>Register Account</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8' }}>
          Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '600' }}>Login here</span>
        </p>
      </div>
    </div>
  );
};

export default Register;

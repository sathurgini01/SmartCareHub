import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    medicalHistory: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/patients/me');
      setProfile(res.data);
      populateForm(res.data);
    } catch {
      setError('Failed to load profile. Please ensure your patient profile has been created.');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data) => {
    setFormData({
      name: data.fullName || data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      gender: data.gender || '',
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split('T')[0]
        : '',
      medicalHistory: data.medicalHistory || '',
    });
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) populateForm(profile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        medicalHistory: formData.medicalHistory,
      };

      const res = await api.put('/api/patients/me', payload);
      setProfile(res.data.patient || res.data);
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    )
      return;

    try {
      await api.delete('/api/patients/me');
      logout();
    } catch {
      setError('Failed to delete account. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  // No profile created yet
  if (!profile && !error) {
    return (
      <div className="profile">
        <h1>Profile</h1>
        <div className="alert-error">Profile not found.</div>
      </div>
    );
  }

  const displayName = profile?.fullName || profile?.name || user?.name || '—';

  return (
    <div className="profile">
      <h1>My Profile</h1>

      {success && <div className="alert-success">{success}</div>}
      {error && <div className="alert-error">{error}</div>}

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{displayName}</h2>
              <span className="badge-green" style={{ marginTop: '4px', display: 'inline-block' }}>
                Patient
              </span>
            </div>
          </div>
          {!editing && (
            <button onClick={handleEdit} className="btn btn-primary">
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Medical History / Notes</label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                className="form-input"
                rows={4}
                placeholder="Existing conditions, allergies, past surgeries…"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              { label: 'Email', value: profile?.email },
              { label: 'Phone', value: profile?.phone || '—' },
              {
                label: 'Date of Birth',
                value: profile?.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                  : '—',
              },
              { label: 'Gender', value: profile?.gender || '—' },
              { label: 'Address', value: profile?.address || '—' },
              {
                label: 'Member Since',
                value: profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : '—',
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: '#0f172a',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.78rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    color: '#f1f5f9',
                    fontWeight: 500,
                    wordBreak: 'break-word',
                  }}
                >
                  {value}
                </p>
              </div>
            ))}

            {/* Medical History spans full width */}
            <div
              style={{
                background: '#0f172a',
                borderRadius: '8px',
                padding: '12px 16px',
                gridColumn: '1 / -1',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Medical History / Notes
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  color: '#f1f5f9',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {profile?.medicalHistory || 'No medical history recorded.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div
        className="card"
        style={{ border: '1px solid #ef4444' }}
      >
        <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Danger Zone</h3>
        <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '0.9rem' }}>
          Deleting your account is permanent and cannot be undone. All your data,
          reports, and prescriptions will be removed.
        </p>
        <button
          onClick={handleDelete}
          className="btn"
          style={{ background: '#ef4444', color: '#fff' }}
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
};

export default Profile;

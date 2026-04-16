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
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/patients/me');
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        address: response.data.address
      });
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.put('/api/patients/me', formData);
      setProfile(response.data);
      setEditing(false);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/api/patients/me');
        logout();
      } catch (error) {
        setError('Failed to delete account');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="alert-error">Profile not found</div>;
  }

  return (
    <div className="profile">
      <h1>Profile</h1>
      <div className="card">
        <div className="profile-header">
          <h2>{profile.name}</h2>
          {!editing && (
            <button onClick={handleEdit} className="btn btn-primary">
              Edit Profile
            </button>
          )}
        </div>
        {editing ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Name</label>
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
                required
              />
            </div>
            <div>
              <label className="form-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                rows="3"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div>
              <strong>Email:</strong> {profile.email}
            </div>
            <div>
              <strong>Phone:</strong> {profile.phone}
            </div>
            <div>
              <strong>Address:</strong> {profile.address}
            </div>
          </div>
        )}
        {error && <div className="alert-error">{error}</div>}
      </div>
      <div className="card">
        <h3>Account Actions</h3>
        <button onClick={handleDelete} className="btn btn-secondary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ShellLayout from '../components/common/ShellLayout';
import PageBanner from '../components/common/PageBanner';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, session, setSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        medicalHistory: user.medicalHistory || '',
      });
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/patients/me');
      const data = res.data.data || res.data;
      setProfile({
        fullName: data.fullName || data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        gender: data.gender || '',
        medicalHistory: data.medicalHistory || '',
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/patients/me', profile);
      toast.success('Profile updated successfully!');
      if (res.data.patient || res.data.data) {
        const updatedData = res.data.patient || res.data.data;
        const updatedUser = {
          ...user,
          ...updatedData,
          id: user?.id || updatedData.id || updatedData._id,
        };
        setSession({ ...session, user: updatedUser });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShellLayout>
      <PageBanner 
        eyebrow="Account Settings"
        title="Your Personal Profile"
        subtitle="Update your contact information and health preferences."
      />

      <div className="card compact-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>Basic Information</h2>
            <p>This information is shared with your doctors during consultations.</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                disabled
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-input"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Home Address</label>
            <input
              type="text"
              className="form-input"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="123 Health St, Medical City"
            />
          </div>

          <div className="section-heading" style={{ marginTop: '2rem' }}>
            <h2>Health Information</h2>
            <p>Providing your medical history helps doctors provide better care.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Medical History</label>
            <textarea
              className="form-input"
              style={{ minHeight: '120px', resize: 'vertical' }}
              value={profile.medicalHistory}
              onChange={(e) => setProfile({ ...profile, medicalHistory: e.target.value })}
              placeholder="Describe any chronic conditions, allergies, or past surgeries..."
            ></textarea>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </ShellLayout>
  );
};

export default Profile;

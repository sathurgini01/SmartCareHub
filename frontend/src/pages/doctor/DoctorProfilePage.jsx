import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import {
  deleteDoctorProfile,
  getDoctorDashboard,
  updateDoctorProfile
} from '../../services/doctorService';

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const { user, setSession, session, logoutUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getDoctorDashboard(user.id).then((data) => setProfile(data.doctor));
  }, [user.id]);

  if (!profile) {
    return <LoadingSpinner label="Loading profile..." />;
  }

  async function handleSave() {
    const updated = await updateDoctorProfile(user.id, profile);
    setProfile(updated);
    setSession({ ...session, user: updated, role: 'doctor' });
    setEditing(false);
    setMessage('Profile updated successfully.');
  }

  async function handleDelete() {
    await deleteDoctorProfile(user.id);
    await logoutUser();
    navigate('/');
  }

  return (
    <ShellLayout>
      <section className="card profile-header-card">
        <div className="profile-header-left">
          <div className="profile-photo-placeholder doctor-profile-avatar">
            {profile.fullName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1>{profile.fullName}</h1>
            <span className="badge-green">Doctor</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setEditing((current) => !current)}>
          {editing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </section>

      {message ? <div className="alert-success">{message}</div> : null}

      <section className="card doctor-profile-card">
        <div className="profile-info-grid">
          <div className="profile-info-box">
            <span>Email</span>
            {editing ? (
              <input className="form-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            ) : (
              <strong>{profile.email || '-'}</strong>
            )}
          </div>
          <div className="profile-info-box">
            <span>Phone</span>
            {editing ? (
              <input className="form-input" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            ) : (
              <strong>{profile.phone || '-'}</strong>
            )}
          </div>
          <div className="profile-info-box">
            <span>Specialization</span>
            {editing ? (
              <input className="form-input" value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} />
            ) : (
              <strong>{profile.specialization || '-'}</strong>
            )}
          </div>
          <div className="profile-info-box">
            <span>Experience</span>
            {editing ? (
              <input className="form-input" type="number" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: Number(e.target.value) })} />
            ) : (
              <strong>{profile.experience ? `${profile.experience} years` : '-'}</strong>
            )}
          </div>
          <div className="profile-info-box">
            <span>License Number</span>
            {editing ? (
              <input className="form-input" value={profile.licenseNumber} onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })} />
            ) : (
              <strong>{profile.licenseNumber || '-'}</strong>
            )}
          </div>
          <div className="profile-info-box">
            <span>Hospital / Clinic</span>
            {editing ? (
              <input className="form-input" value={profile.hospital || ''} onChange={(e) => setProfile({ ...profile, hospital: e.target.value })} />
            ) : (
              <strong>{profile.hospital || '-'}</strong>
            )}
          </div>
        </div>

        <div className="profile-notes-box">
          <span>Bio / About</span>
          {editing ? (
            <textarea className="form-input profile-textarea" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          ) : (
            <strong>{profile.bio || 'No profile notes recorded.'}</strong>
          )}
        </div>

        {editing ? (
          <div className="button-row">
            <button className="btn btn-primary" onClick={handleSave}>
              Save Profile
            </button>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        ) : null}
      </section>

      <section className="card danger-zone-card">
        <h2>Danger Zone</h2>
        <p>
          Deleting your doctor account is permanent and cannot be undone. Your doctor profile,
          availability, appointments, and prescriptions will be removed.
        </p>
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete My Account
        </button>
      </section>
    </ShellLayout>
  );
}

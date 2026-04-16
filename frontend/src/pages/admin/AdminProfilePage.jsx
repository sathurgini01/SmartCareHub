import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import {
  deleteAdminProfile,
  getAdminProfile,
  updateAdminProfile
} from '../../services/adminService';
import { adminNavItems } from '../../utils/navigation';

export default function AdminProfilePage() {
  const { user, session, setSession, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getAdminProfile(user.id).then((admin) => setProfile(admin));
  }, [user.id]);

  if (!profile) {
    return <LoadingSpinner label="Loading admin profile..." />;
  }

  async function handleSave() {
    const updated = await updateAdminProfile(user.id, profile);
    setSession({ ...session, user: updated, role: 'admin' });
    setProfile(updated);
    setMessage('Admin profile updated successfully.');
  }

  async function handleDelete() {
    await deleteAdminProfile(user.id);
    await logoutUser();
    navigate('/');
  }

  return (
    <ShellLayout
      title="Admin Profile"
      subtitle="View and edit admin details from a clean profile page."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="Admin Profile"
        title="Manage admin account details"
        subtitle="Open profile details, update contact information, and maintain admin account settings from one page."
        variant="admin-profile"
      />

      {message ? <div className="alert-success">{message}</div> : null}

      <section className="card profile-page-grid">
        <div className="profile-photo-card">
          <div className="profile-photo-placeholder">{profile.fullName.slice(0, 2).toUpperCase()}</div>
          <h3>{profile.fullName}</h3>
          <p>{profile.role}</p>
        </div>

        <div>
          <div className="form-grid">
            <FormInput label="Full Name" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
            <FormInput label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <FormInput label="Role" value={profile.role} readOnly />
            <FormInput label="Title" value={profile.title || ''} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
            <FormInput label="Admin Code" value={profile.accessKey || ''} onChange={(e) => setProfile({ ...profile, accessKey: e.target.value })} />
          </div>

          <div className="button-row">
            <button className="btn btn-primary" onClick={handleSave}>
              Edit Profile
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </section>
    </ShellLayout>
  );
}

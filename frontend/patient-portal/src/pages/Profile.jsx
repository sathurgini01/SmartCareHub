import React, { useState, useEffect } from 'react';
import { getMyProfile, updateProfile } from '../api/patientApi';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    getMyProfile().then(res => {
      setProfile(res.data);
      setForm({ name: res.data.name, email: res.data.email });
    });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async e => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await updateProfile(form);
      setMsg('Profile updated!');
      setEdit(false);
      setProfile({ ...profile, ...form });
    } catch (error) {
      setErr('Update failed');
    }
  };

  if (!profile) return <div className="card" style={{ color: '#fff', margin: '40px auto', maxWidth: 600 }}>Loading...</div>;

  return (
    <div className="card" style={{ maxWidth: 600, margin: '40px auto', padding: '2rem', color: '#fff' }}>
      <h2>Profile</h2>
      {msg && <div className="alert-success">{msg}</div>}
      {err && <div className="alert-error">{err}</div>}
      {!edit ? (
        <>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <button className="btn btn-primary" onClick={() => setEdit(true)}>Edit Profile</button>
        </>
      ) : (
        <form onSubmit={handleUpdate}>
          <label className="form-label">Name</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
          <label className="form-label">Email</label>
          <input className="form-input" name="email" value={form.email} onChange={handleChange} required />
          <button className="btn btn-primary" type="submit">Save</button>
          <button className="btn btn-secondary" type="button" onClick={() => setEdit(false)} style={{ marginLeft: 8 }}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default Profile;

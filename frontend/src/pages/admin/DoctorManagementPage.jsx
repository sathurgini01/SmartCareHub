import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import ShellLayout from '../../components/common/ShellLayout';
import PageBanner from '../../components/common/PageBanner';
import { adminNavItems } from '../../utils/navigation';
import { getAdminDashboard, updateDoctorVerification, deleteDoctorAccount, updateDoctorAccount } from '../../services/adminService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('directory');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingDoctor, setViewingDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminDashboard();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Failed to load doctor data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    return {
      pending: doctors.filter(d => d.status === 'pending').length,
      approved: doctors.filter(d => d.status === 'approved').length,
      rejected: doctors.filter(d => d.status === 'rejected').length,
      total: doctors.length
    };
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const matchesSearch = d.fullName.toLowerCase().includes(query.toLowerCase()) || 
                            d.email.toLowerCase().includes(query.toLowerCase()) ||
                            d.specialization.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : d.status === statusFilter;
      
      if (activeTab === 'requests') {
        return matchesSearch && d.status === 'pending';
      }
      return matchesSearch && matchesStatus;
    });
  }, [doctors, query, statusFilter, activeTab]);

  const handleVerify = async (id, status) => {
    try {
      await updateDoctorVerification(id, status);
      toast.success(`Doctor request ${status === 'approved' ? 'accepted' : 'rejected'}`);
      loadData();
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor account? This action cannot be undone.')) {
      try {
        await deleteDoctorAccount(id);
        toast.success('Doctor deleted successfully');
        loadData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete doctor');
      }
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor({ ...doctor });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoctorAccount(editingDoctor.id, editingDoctor);
      toast.success('Doctor updated successfully');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update doctor');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingDoctor(prev => ({ ...prev, [name]: value }));
  };

  return (
    <ShellLayout
      title="Doctor Management"
      subtitle="Manage doctor registrations, verify credentials, and maintain the medical directory."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="Medical Staff"
        title="Doctor Administration"
        subtitle="Review new applications, update professional details, and manage platform access for healthcare providers."
        variant="admin-dashboard"
      />

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '24px' }}>
        <div className="card stat-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Doctors</span>
          <h2 style={{ color: '#fff', fontSize: '2rem', margin: '8px 0 0 0' }}>{stats.total}</h2>
        </div>
        <div className="card stat-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #fbbf24' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Pending</span>
          <h2 style={{ color: '#fbbf24', fontSize: '2rem', margin: '8px 0 0 0' }}>{stats.pending}</h2>
        </div>
        <div className="card stat-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #10b981' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Approved</span>
          <h2 style={{ color: '#10b981', fontSize: '2rem', margin: '8px 0 0 0' }}>{stats.approved}</h2>
        </div>
        <div className="card stat-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rejected</span>
          <h2 style={{ color: '#ef4444', fontSize: '2rem', margin: '8px 0 0 0' }}>{stats.rejected}</h2>
        </div>
      </div>

      <div className="card" style={{ marginTop: '32px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', background: '#1e293b' }}>
          <button 
            onClick={() => setActiveTab('directory')}
            style={{ 
              padding: '16px 24px', 
              background: activeTab === 'directory' ? '#0f172a' : 'transparent',
              border: 'none',
              color: activeTab === 'directory' ? '#3b82f6' : '#94a3b8',
              fontWeight: activeTab === 'directory' ? '600' : '400',
              cursor: 'pointer',
              borderBottom: activeTab === 'directory' ? '2px solid #3b82f6' : 'none'
            }}
          >
            Doctor Directory
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            style={{ 
              padding: '16px 24px', 
              background: activeTab === 'requests' ? '#0f172a' : 'transparent',
              border: 'none',
              color: activeTab === 'requests' ? '#3b82f6' : '#94a3b8',
              fontWeight: activeTab === 'requests' ? '600' : '400',
              cursor: 'pointer',
              borderBottom: activeTab === 'requests' ? '2px solid #3b82f6' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Pending Requests
            {stats.pending > 0 && (
              <span style={{ 
                background: '#ef4444', 
                color: '#fff', 
                fontSize: '0.7rem', 
                padding: '2px 6px', 
                borderRadius: '10px',
                fontWeight: '700'
              }}>
                {stats.pending}
              </span>
            )}
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Search by name, email or specialty..." 
              className="form-control" 
              style={{ flex: 1, padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {activeTab === 'directory' && (
              <select 
                className="form-control" 
                style={{ width: '200px', padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            )}
          </div>

          <DataTable
            columns={activeTab === 'directory' 
              ? ['Doctor', 'Specialization', 'Experience', 'Status', 'Actions']
              : ['Doctor', 'License Number', 'Hospital', 'Experience', 'Actions']
            }
            rows={filteredDoctors}
            loading={loading}
            emptyTitle={activeTab === 'directory' ? "No doctors found" : "No pending requests"}
            emptyText="Try adjusting your filters or search terms."
            renderRow={(doctor) => (
              <tr key={doctor.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{doctor.fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{doctor.email}</div>
                </td>
                <td style={{ padding: '16px' }}>{activeTab === 'directory' ? doctor.specialization : doctor.licenseNumber}</td>
                <td style={{ padding: '16px' }}>{activeTab === 'directory' ? `${doctor.experience} yrs` : doctor.hospital}</td>
                <td style={{ padding: '16px' }}>
                  {activeTab === 'directory' ? (
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      background: doctor.status === 'approved' ? '#064e3b' : doctor.status === 'rejected' ? '#7f1d1d' : '#451a03',
                      color: doctor.status === 'approved' ? '#10b981' : doctor.status === 'rejected' ? '#ef4444' : '#fbbf24'
                    }}>
                      {doctor.status.toUpperCase()}
                    </span>
                  ) : (
                    `${doctor.experience} years`
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {activeTab === 'directory' ? (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewingDoctor(doctor)}>View</button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleEdit(doctor)}>Edit</button>
                        <button className="btn btn-danger btn-sm" style={{ background: '#991b1b' }} onClick={() => handleDelete(doctor.id)}>Delete</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleVerify(doctor.id, 'approved')}>Accept</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleVerify(doctor.id, 'rejected')}>Reject</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewingDoctor(doctor)}>Details</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          />
        </div>
      </div>

      {/* View Modal */}
      {viewingDoctor && (
        <Modal title="Doctor Detailed Profile" open={true} onClose={() => setViewingDoctor(null)}>
          <div style={{ color: '#cbd5e1' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ color: '#3b82f6', marginBottom: '12px' }}>Personal Info</h4>
                <p><strong>Name:</strong> {viewingDoctor.fullName}</p>
                <p><strong>Email:</strong> {viewingDoctor.email}</p>
                <p><strong>Phone:</strong> {viewingDoctor.phone || 'N/A'}</p>
              </div>
              <div>
                <h4 style={{ color: '#3b82f6', marginBottom: '12px' }}>Professional Info</h4>
                <p><strong>Specialty:</strong> {viewingDoctor.specialization}</p>
                <p><strong>License:</strong> {viewingDoctor.licenseNumber}</p>
                <p><strong>Experience:</strong> {viewingDoctor.experience} years</p>
                <p><strong>Hospital:</strong> {viewingDoctor.hospital}</p>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '8px' }}>Biography</h4>
              <p style={{ lineHeight: '1.6' }}>{viewingDoctor.bio || 'No biography provided.'}</p>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p><strong>Status:</strong> <span style={{ color: viewingDoctor.status === 'approved' ? '#10b981' : '#fbbf24' }}>{viewingDoctor.status}</span></p>
              <p><strong>Registered:</strong> {new Date(viewingDoctor.submittedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDoctor && (
        <Modal title="Update Doctor Information" open={true} onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}>Full Name</label>
                <input type="text" name="fullName" className="form-control" value={editingDoctor.fullName} onChange={handleInputChange} required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}>Specialization</label>
                <input type="text" name="specialization" className="form-control" value={editingDoctor.specialization} onChange={handleInputChange} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}>Hospital</label>
                <input type="text" name="hospital" className="form-control" value={editingDoctor.hospital} onChange={handleInputChange} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}>Experience (Years)</label>
                <input type="number" name="experience" className="form-control" value={editingDoctor.experience} onChange={handleInputChange} required />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}>Bio</label>
              <textarea name="bio" className="form-control" rows="3" value={editingDoctor.bio} onChange={handleInputChange}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .form-control {
          width: 100%;
          padding: 10px 14px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          color: #fff;
          outline: none;
        }
        .form-control:focus {
          border-color: #3b82f6;
        }
        .stat-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(10px);
        }
      `}} />
    </ShellLayout>
  );
}

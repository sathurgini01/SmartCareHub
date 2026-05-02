import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import ShellLayout from '../../components/common/ShellLayout';
import PageBanner from '../../components/common/PageBanner';
import { adminNavItems } from '../../utils/navigation';
import { getAllPatients, updatePatient, deletePatient, getPatientPrescriptions } from '../../services/patientAdminService';
import { API_BASE_URL } from '../../api';
import { getAccessToken } from '../../services/storage';

export default function PatientManagementPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllPatients();
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await deletePatient(id);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast.error('Failed to delete patient');
      }
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient({ ...patient });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePatient(editingPatient._id, editingPatient);
      toast.success('Patient updated successfully');
      setShowEditModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = async (patient) => {
    setViewingPatient(patient);
    setShowDetailsModal(true);
    setActiveTab('overview');
    
    // Fetch prescriptions from doctor-service via proxy
    setLoadingPrescriptions(true);
    try {
      const response = await getPatientPrescriptions(patient.userId);
      setPatientPrescriptions(response || []);
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      setPatientPrescriptions([]);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadReport = async (reportId, fileName) => {
    try {
      const token = getAccessToken();
      const response = await fetch(`${API_BASE_URL}/patients/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  return (
    <ShellLayout
      title="Patient Management"
      subtitle="View, edit, and manage all registered patients on the platform."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="User Administration"
        title="Patient Management"
        subtitle="Maintain accurate records of all patients. You can update their profiles or remove inactive users."
        variant="admin-dashboard"
      />

      <div className="card" style={{ marginTop: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', margin: 0 }}>Registered Patients</h3>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total: {patients.length}</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading patients...</div>
        ) : patients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No patients found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1' }}>
              <thead style={{ backgroundColor: '#1e293b' }}>
                <tr>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left' }}>Gender</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} style={{ borderBottom: '1px solid #1e293b' }} className="table-row-hover">
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{patient.fullName || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>{patient.email}</td>
                    <td style={{ padding: '16px 20px' }}>{patient.phone || 'N/A'}</td>
                    <td style={{ padding: '16px 20px' }}>
                       <span style={{ 
                         padding: '4px 8px', 
                         borderRadius: '4px', 
                         fontSize: '0.8rem',
                         backgroundColor: patient.gender === 'Male' ? '#1e3a8a' : patient.gender === 'Female' ? '#701a75' : '#334155',
                         color: '#fff',
                         textTransform: 'capitalize'
                       }}>
                         {patient.gender || 'N/A'}
                       </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleViewDetails(patient)}
                        >
                          View
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleEdit(patient)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#991b1b' }}
                          onClick={() => handleDelete(patient._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '24px' }}>Edit Patient Details</h3>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Full Name</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    className="form-control"
                    value={editingPatient.fullName || ''} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Email</label>
                  <input 
                    type="email" 
                    className="form-control"
                    value={editingPatient.email} 
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    className="form-control"
                    value={editingPatient.phone || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Gender</label>
                  <select 
                    name="gender" 
                    className="form-control"
                    value={editingPatient.gender || ''} 
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Address</label>
                <textarea 
                  name="address" 
                  className="form-control"
                  style={{ minHeight: '80px' }}
                  value={editingPatient.address || ''} 
                  onChange={handleInputChange}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px' }}>Medical History</label>
                <textarea 
                  name="medicalHistory" 
                  className="form-control"
                  style={{ minHeight: '100px' }}
                  value={editingPatient.medicalHistory || ''} 
                  onChange={handleInputChange}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showDetailsModal && viewingPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
              <div>
                <h2 style={{ color: '#fff', margin: 0 }}>{viewingPatient.fullName}</h2>
                <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Patient Details & Records</p>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', background: '#0f172a' }}>
              {['overview', 'prescriptions', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '16px 24px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                    color: activeTab === tab ? '#3b82f6' : '#94a3b8',
                    fontWeight: activeTab === tab ? '600' : '400',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#020617' }}>
              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div className="detail-section">
                    <h4 style={{ color: '#3b82f6', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Personal Information</h4>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Email Address</label>
                        <div style={{ color: '#fff' }}>{viewingPatient.email}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Phone Number</label>
                        <div style={{ color: '#fff' }}>{viewingPatient.phone || 'Not provided'}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Gender</label>
                        <div style={{ color: '#fff' }}>{viewingPatient.gender || 'Not specified'}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Member Since</label>
                        <div style={{ color: '#fff' }}>{formatDate(viewingPatient.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 style={{ color: '#3b82f6', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Location & Medical</h4>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Residential Address</label>
                        <div style={{ color: '#fff', lineHeight: '1.5' }}>{viewingPatient.address || 'No address provided'}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>Medical History</label>
                        <div style={{ 
                          color: '#fff', 
                          lineHeight: '1.6', 
                          background: '#1e293b', 
                          padding: '12px', 
                          borderRadius: '8px',
                          borderLeft: '4px solid #3b82f6'
                        }}>
                          {viewingPatient.medicalHistory || 'No medical history recorded.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prescriptions' && (
                <div>
                  <h4 style={{ color: '#3b82f6', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Patient Prescriptions</h4>
                  {loadingPrescriptions ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading prescriptions...</div>
                  ) : !patientPrescriptions || patientPrescriptions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#0f172a', borderRadius: '12px' }}>
                      No prescriptions found for this patient.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                        <thead style={{ backgroundColor: '#1e293b' }}>
                          <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Doctor</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Medications</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Diagnosis</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientPrescriptions.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                              <td style={{ padding: '16px' }}>
                                <div style={{ fontWeight: '600', color: '#fff' }}>Dr. {p.doctorName}</div>
                              </td>
                              <td style={{ padding: '16px' }}>
                                {p.medicines && p.medicines.map((m, mi) => (
                                  <div key={mi} style={{ marginBottom: mi === p.medicines.length - 1 ? 0 : '8px' }}>
                                    <strong>{m.name}</strong> - {m.dosage} ({m.frequency})
                                    {m.instructions && <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{m.instructions}</div>}
                                  </div>
                                ))}
                              </td>
                              <td style={{ padding: '16px' }}>{p.diagnosis || 'N/A'}</td>
                              <td style={{ padding: '16px' }}>{formatDate(p.date || p.issuedDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reports' && (
                <div>
                  <h4 style={{ color: '#3b82f6', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Medical Reports</h4>
                  {!viewingPatient.reports || viewingPatient.reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#0f172a', borderRadius: '12px' }}>
                      No reports uploaded by this patient.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                        <thead style={{ backgroundColor: '#1e293b' }}>
                          <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>File Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Doctor Involved</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Description</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingPatient.reports.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                              <td style={{ padding: '16px' }}>
                                <div style={{ fontWeight: '600', color: '#fff' }}>{r.fileName}</div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.fileType}</span>
                              </td>
                              <td style={{ padding: '16px' }}>Dr. {r.doctorName || 'N/A'}</td>
                              <td style={{ padding: '16px' }}>{r.description || 'N/A'}</td>
                              <td style={{ padding: '16px' }}>{formatDate(r.uploadedAt)}</td>
                              <td style={{ padding: '16px', textAlign: 'center' }}>
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleDownloadReport(r._id, r.fileName)}
                                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                >
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div style={{ padding: '20px 32px', borderTop: '1px solid #1e293b', background: '#0f172a', textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close View</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .table-row-hover:hover {
          background-color: #1e293b44;
        }
        .form-control {
          width: 100%;
          padding: 10px 14px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-control:focus {
          border-color: #3b82f6;
        }
        .btn-danger:hover {
          background-color: #b91c1c !important;
        }
        .detail-section {
          background: #0f172a;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #1e293b;
        }
      `}} />
    </ShellLayout>
  );
}

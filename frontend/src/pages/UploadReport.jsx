import React, { useState, useEffect } from 'react';
import { uploadReport, getReports } from '../api/patientApi';
import appointmentService from '../services/appointmentService';
import { FiUpload, FiFileText, FiUser, FiCheckCircle, FiAlertCircle, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './MyAppointments.css';

const UploadReport = () => {
  const [file, setFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [confirmedDoctors, setConfirmedDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingReports, setFetchingReports] = useState(false);
  const [description, setDescription] = useState('');

  const fetchReports = async () => {
    setFetchingReports(true);
    try {
      const res = await getReports();
      setReports(res.data || []);
    } catch (error) {
      console.error('Fetch reports error:', error);
      setReports([]);
    } finally {
      setFetchingReports(false);
    }
  };

  const fetchConfirmedDoctors = async () => {
    try {
      // Fetch all appointments and filter for confirmed/completed sessions
      const res = await appointmentService.getMyAppointments({ limit: 100 });
      if (res.data.success) {
        const appointments = res.data.data;
        // Filter for confirmed/completed status and get unique doctors
        const confirmed = appointments.filter(apt => 
          ['confirmed', 'completed', 'in-progress'].includes(apt.status)
        );
        
        // Use a map to get unique doctors by ID
        const uniqueDoctors = [];
        const seenIds = new Set();
        
        confirmed.forEach(apt => {
          if (!seenIds.has(apt.doctorId)) {
            seenIds.add(apt.doctorId);
            uniqueDoctors.push({
              id: apt.doctorId,
              name: apt.doctorName,
              email: apt.doctorEmail,
              specialty: apt.specialty
            });
          }
        });
        
        setConfirmedDoctors(uniqueDoctors);
      }
    } catch (error) {
      console.error('Fetch doctors error:', error);
    }
  };

  const handleFile = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async e => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a report file');
      return;
    }
    
    if (!selectedDoctorId) {
      toast.error('Please select a doctor to share this report with');
      return;
    }

    const doctor = confirmedDoctors.find(d => d.id === selectedDoctorId);
    if (!doctor) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('report', file);
    formData.append('doctorId', doctor.id);
    formData.append('doctorName', doctor.name);
    formData.append('doctorEmail', doctor.email);
    formData.append('description', description);

    try {
      await uploadReport(formData);
      toast.success('Report uploaded and shared successfully!');
      setFile(null);
      setDescription('');
      setSelectedDoctorId('');
      // Reset the file input
      const fileInput = document.getElementById('report-upload');
      if (fileInput) fileInput.value = '';
      fetchReports();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Upload failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchReports(); 
    fetchConfirmedDoctors();
  }, []);

  return (
    <div className="my-appointments page-wrapper">
      <div className="container">
        <div className="page-header animate-slideUp">
          <div>
            <h1>Medical Reports</h1>
            <p>Upload and share your lab results or medical documents with your doctors</p>
          </div>
        </div>

        <div className="card animate-fadeIn" style={{ marginBottom: '32px', padding: '2rem' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiUpload className="text-primary" /> Upload New Report
          </h2>
          
          <form onSubmit={handleUpload}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUser size={14} /> Select Doctor
                </label>
                <select 
                  className="form-input" 
                  value={selectedDoctorId} 
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Select a Doctor --</option>
                  {confirmedDoctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialty})
                    </option>
                  ))}
                </select>
                {confirmedDoctors.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    * Only doctors from confirmed appointments are listed
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Report Description (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Blood Test, MRI Scan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Report File (PDF, JPG, PNG - Max 5MB)</label>
              <div style={{ 
                border: '2px dashed var(--border)', 
                borderRadius: '8px', 
                padding: '20px', 
                textAlign: 'center',
                background: file ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                transition: 'all 0.3s ease'
              }}>
                <input 
                  id="report-upload"
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleFile}
                  style={{ display: 'none' }}
                />
                <label htmlFor="report-upload" style={{ cursor: 'pointer' }}>
                  {file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <FiCheckCircle size={32} color="#10b981" />
                      <p style={{ margin: '10px 0 0 0', fontWeight: '600' }}>{file.name}</p>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to change file</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <FiUpload size={32} color="var(--text-muted)" />
                      <p style={{ margin: '10px 0 0 0' }}>Click to browse or drag and drop</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? (
                <>
                  <div className="spinner-sm"></div> Uploading...
                </>
              ) : (
                <>
                  <FiUpload /> Upload and Share with Doctor
                </>
              )}
            </button>
          </form>
        </div>

        <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiFileText className="text-primary" /> Your Uploaded Reports
        </h2>

        {fetchingReports ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state card">
            <FiFileText size={48} color="var(--text-muted)" />
            <h3>No reports found</h3>
            <p>You haven't uploaded any medical reports yet.</p>
          </div>
        ) : (
          <div className="appointments-list stagger-children">
            {reports.map((r) => (
              <div key={r._id} className="appointment-card card animate-fadeIn">
                <div className="apt-card-left" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="apt-date-block">
                    <FiFileText size={24} color="var(--primary)" />
                    <span style={{ fontSize: '10px', marginTop: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                      {r.fileType || 'DOC'}
                    </span>
                  </div>
                </div>

                <div className="apt-card-content">
                  <div className="apt-card-top">
                    <div>
                      <h3 style={{ fontSize: '1.1rem' }}>{r.fileName}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Uploaded on {new Date(r.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="apt-badges">
                      <span className="badge badge-success">Shared</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      <strong>Shared with:</strong> Dr. {r.doctorName}
                    </p>
                    {r.description && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        "{r.description}"
                      </p>
                    )}
                  </div>

                  <div className="apt-card-actions" style={{ marginTop: '16px' }}>
                    <a 
                      href={`http://localhost:5000${r.downloadPath}`} 
                      className="btn btn-secondary btn-sm"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FiExternalLink /> View Report
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReport;

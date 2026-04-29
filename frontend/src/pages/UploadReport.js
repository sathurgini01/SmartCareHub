import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const MAX_MB = 5;

const UploadReport = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const res = await api.get('/patients/reports');
      setReports(res.data);
    } catch {
      // Non-critical — just don't show the list
    } finally {
      setReportsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const sizeMB = selected.size / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      setError(`File is too large. Maximum allowed size is ${MAX_MB} MB.`);
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description for the report.');
      return;
    }

    const formData = new FormData();
    formData.append('report', file);
    formData.append('description', description.trim());
    if (user?.id) formData.append('patientId', user.id);

    setLoading(true);
    try {
      await api.post('/patients/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Report uploaded successfully.');
      setFile(null);
      setDescription('');
      // Refresh list
      fetchReports();
    } catch (err) {
      const msg =
        err.response?.data?.error || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-report">
      <h1 style={{ marginBottom: '24px' }}>Upload Medical Report</h1>

      {/* Upload Form */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#94a3b8' }}>
          UPLOAD NEW REPORT
        </h2>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label">Select Report File</label>
          <div
            style={{
              border: `2px dashed ${file ? '#10b981' : '#334155'}`,
              borderRadius: '10px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '16px',
              cursor: 'pointer',
              transition: 'border-color 0.3s',
              background: '#0f172a',
            }}
          >
            {file ? (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                <p style={{ color: '#10b981', fontWeight: 600, margin: 0 }}>
                  {file.name}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📁</div>
                <p style={{ color: '#94a3b8', margin: '0 0 8px' }}>
                  Click to select or drag a file here
                </p>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                  PDF, DOC, DOCX, JPG, PNG — max {MAX_MB} MB
                </p>
              </div>
            )}
            <input
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                cursor: 'pointer',
              }}
            />
          </div>

          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            rows={4}
            placeholder="Describe the report (e.g. Blood test results — 12 April 2026)…"
            required
          />

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.8rem' }}
            >
              {loading ? 'Uploading…' : '📤 Upload Report'}
            </button>
            {file && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setFile(null);
                  setError('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Uploaded Reports List */}
      <div className="card">
        <h2 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#94a3b8' }}>
          MY UPLOADED REPORTS
        </h2>

        {reportsLoading ? (
          <div className="loading" style={{ minHeight: '80px' }}>
            <div className="spinner" />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📂</div>
            <p style={{ margin: 0 }}>No reports uploaded yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>Description</th>
                  <th>Uploaded On</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, idx) => (
                  <tr key={r._id || idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{r.fileName}</td>
                    <td style={{ color: '#94a3b8' }}>{r.description || '—'}</td>
                    <td>{new Date(r.uploadedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReport;

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const UploadReport = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('report', file);
    formData.append('description', description);
    formData.append('patientId', user?.id);

    setLoading(true);
try {
      await api.post('/api/patients/upload-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Report uploaded successfully');
      setFile(null);
      setDescription('');
    } catch (error) {
      setError('Failed to upload report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-report">
      <h1>Upload Medical Report</h1>
      <div className="card">
        <h2>Upload Your Medical Report</h2>
        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Select Report File</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              rows="4"
              placeholder="Enter report description..."
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Uploading...' : 'Upload Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadReport;
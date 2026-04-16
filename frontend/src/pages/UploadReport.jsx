import React, { useState } from 'react';
import { uploadReport, getReports } from '../api/patientApi';

const UploadReport = () => {
  const [file, setFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const fetchReports = async () => {
    try {
      const res = await getReports();
      setReports(res.data);
    } catch {
      setReports([]);
    }
  };

  const handleFile = e => setFile(e.target.files[0]);
  const handleUpload = async e => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!file) return setErr('Please select a file');
    const formData = new FormData();
    formData.append('report', file);
    try {
      await uploadReport(formData);
      setMsg('Report uploaded!');
      setFile(null);
      fetchReports();
    } catch {
      setErr('Upload failed');
    }
  };

  React.useEffect(() => { fetchReports(); }, []);

  return (
    <div className="card" style={{ maxWidth: 600, margin: '40px auto', padding: '2rem', color: '#fff' }}>
      <h2>Upload Report</h2>
      {msg && <div className="alert-success">{msg}</div>}
      {err && <div className="alert-error">{err}</div>}
      <form onSubmit={handleUpload}>
        <input className="form-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} />
        <button className="btn btn-primary" type="submit" style={{ marginTop: 8 }}>Upload</button>
      </form>
      <h3 style={{ marginTop: 24 }}>Uploaded Reports</h3>
      <ul>
        {reports.length === 0 && <li>No reports found.</li>}
        {reports.map((r, i) => (
          <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.filename}</a></li>
        ))}
      </ul>
    </div>
  );
};

export default UploadReport;

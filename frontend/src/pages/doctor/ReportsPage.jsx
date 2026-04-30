import { useEffect, useState } from 'react';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { fetchReportFile, getAssignedReports } from '../../services/doctorService';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    getAssignedReports().then((data) => setReports(data));
  }, []);

  async function handleDownload(report) {
    const blob = await fetchReportFile(report._id);
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = report.fileName || 'report';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }

  async function handlePreview(report) {
    const blob = await fetchReportFile(report._id);
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <ShellLayout>
      <PageBanner
        eyebrow="Report Viewer"
        title="Patient uploaded reports"
        subtitle="Preview lab reports, scans, history files, and prescription uploads from one clean review table."
        variant="reports"
      />
      <section className="card">
        <div className="section-heading">
          <h2>Reports View</h2>
          <p>Preview and download files that patients assigned directly to you.</p>
        </div>
        <DataTable
          columns={['Patient', 'Doctor', 'File Type', 'Upload Date', 'File Name', 'Actions']}
          rows={reports}
          emptyTitle="No reports available"
          emptyText="Patient uploads assigned to you will appear here once available."
          renderRow={(item) => (
            <tr key={item._id}>
              <td>{item.patientName}</td>
              <td>{item.doctorName}</td>
              <td><Badge status={(item.fileType || 'file').toLowerCase()} /></td>
              <td>{new Date(item.uploadedAt).toLocaleDateString()}</td>
              <td>{item.fileName}</td>
              <td>
                <div className="button-row">
                  <button className="btn btn-primary" onClick={() => handlePreview(item)}>Preview</button>
                  <button className="btn btn-secondary" onClick={() => handleDownload(item)}>Download</button>
                </div>
              </td>
            </tr>
          )}
        />
      </section>
    </ShellLayout>
  );
}

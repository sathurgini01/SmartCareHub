import { useEffect, useState } from 'react';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDashboard } from '../../services/doctorService';
import { doctorNavItems } from '../../utils/navigation';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    getDoctorDashboard(user.id).then((data) => setReports(data.reports));
  }, [user.id]);

  return (
    <ShellLayout
      title="Patient Uploaded Reports"
      subtitle="Review lab reports, scan reports, prescription uploads, and medical history files."
      navItems={doctorNavItems}
    >
      <PageBanner
        eyebrow="Report Viewer"
        title="Patient uploaded reports"
        subtitle="Preview lab reports, scans, history files, and prescription uploads from one clean review table."
        variant="reports"
      />
      <section className="card">
        <div className="section-heading">
          <h2>Reports View</h2>
          <p>Preview and download patient-uploaded files in a clean, professional table.</p>
        </div>
        <DataTable
          columns={['Patient', 'Category', 'File Type', 'Upload Date', 'File Name', 'Actions']}
          rows={reports}
          emptyTitle="No reports available"
          emptyText="Patient uploads will appear here once available."
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.patientName}</td>
              <td>{item.category}</td>
              <td><Badge status={item.fileType.toLowerCase()} /></td>
              <td>{item.uploadDate}</td>
              <td>{item.fileName}</td>
              <td>
                <div className="button-row">
                  <button className="btn btn-primary">Preview</button>
                  <button className="btn btn-secondary">Download</button>
                </div>
              </td>
            </tr>
          )}
        />
      </section>
    </ShellLayout>
  );
}

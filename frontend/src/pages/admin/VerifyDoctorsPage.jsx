import { useCallback, useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { getAdminDashboard, updateDoctorVerification } from '../../services/adminService';
import { adminNavItems } from '../../utils/navigation';

export default function VerifyDoctorsPage() {
  const [doctors, setDoctors] = useState([]);

  const loadData = useCallback(async () => {
    const nextData = await getAdminDashboard();
    setDoctors(nextData.doctors.filter((doctor) => doctor.status === 'pending'));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ShellLayout
      title="Verify Doctor Requests"
      subtitle="Review pending doctor registration requests and take action from one clear table."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="Doctor Verification"
        title="Pending doctor request list"
        subtitle="Open every doctor request with full details like specialization, license, hospital, experience, and approve or reject neatly."
        variant="verify-doctors"
      />

      <section className="card">
        <div className="section-heading">
          <h2>Pending Requests</h2>
          <p>Only doctor requests waiting for approval are shown here.</p>
        </div>

        <DataTable
          columns={['Doctor', 'Email', 'Specialization', 'License', 'Experience', 'Hospital', 'Submitted Date', 'Actions']}
          rows={doctors}
          emptyTitle="No pending requests"
          emptyText="All doctor registrations have already been reviewed."
          renderRow={(doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.fullName}</td>
              <td>{doctor.email}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.licenseNumber}</td>
              <td>{doctor.experience} years</td>
              <td>{doctor.hospital}</td>
              <td>{doctor.submittedDate?.slice(0, 10)}</td>
              <td>
                <div className="table-action-row">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => updateDoctorVerification(doctor.id, 'approved').then(loadData)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => updateDoctorVerification(doctor.id, 'rejected').then(loadData)}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </section>
    </ShellLayout>
  );
}

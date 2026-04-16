import { useEffect, useState } from 'react';
import ShellLayout from '../../components/common/ShellLayout';
import DoctorReviewPanel from '../../components/admin/DoctorReviewPanel';
import { getAdminDashboard, updateDoctorVerification } from '../../services/adminService';
import { adminNavItems } from '../../utils/navigation';

export default function ApprovalsPage() {
  const [doctors, setDoctors] = useState([]);

  function loadData() {
    getAdminDashboard().then((data) => setDoctors(data.doctors));
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ShellLayout
      title="Doctor Approvals"
      subtitle="Dedicated approval workflow page for admin account management."
      navItems={adminNavItems}
    >
      <section className="card">
        <div className="review-stack">
          {doctors.map((doctor) => (
            <DoctorReviewPanel
              key={doctor.id}
              doctor={doctor}
              onStatusChange={(id, status) => updateDoctorVerification(id, status).then(loadData)}
            />
          ))}
        </div>
      </section>
    </ShellLayout>
  );
}

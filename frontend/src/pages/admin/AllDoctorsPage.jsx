import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { getAdminDashboard } from '../../services/adminService';
import { adminNavItems } from '../../utils/navigation';

export default function AllDoctorsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    getAdminDashboard().then((data) => setDoctors(data.doctors));
  }, []);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) => {
        const matchesQuery =
          doctor.fullName.toLowerCase().includes(query.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = filter === 'all' ? true : doctor.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [doctors, query, filter]
  );

  return (
    <ShellLayout
      title="All Doctors"
      subtitle="Search doctors, filter by status, and open full application details."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="Doctor Directory"
        title="All registered doctors"
        subtitle="Search, filter, and open doctor registration details with better alignment and cleaner admin flow."
        variant="admin-directory"
      />
      <section className="card">
        <div className="toolbar">
          <input className="form-input" placeholder="Search doctors" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="form-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <DataTable
          columns={['Doctor', 'Specialization', 'Experience', 'Hospital', 'Status', 'Actions']}
          rows={filteredDoctors}
          emptyTitle="No doctors match this filter"
          emptyText="Try another search term or status."
          renderRow={(doctor) => (
            <tr key={doctor.id}>
              <td>{doctor.fullName}</td>
              <td>{doctor.specialization}</td>
              <td>{doctor.experience} years</td>
              <td>{doctor.hospital}</td>
              <td>{doctor.status}</td>
              <td>
                <button className="btn btn-secondary" onClick={() => setSelectedDoctor(doctor)}>
                  View Full Details
                </button>
              </td>
            </tr>
          )}
        />
      </section>

      <Modal title="Doctor Full Application Details" open={Boolean(selectedDoctor)} onClose={() => setSelectedDoctor(null)}>
        {selectedDoctor ? (
          <div className="modal-content-grid">
            <p><strong>Name:</strong> {selectedDoctor.fullName}</p>
            <p><strong>Email:</strong> {selectedDoctor.email}</p>
            <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
            <p><strong>License Number:</strong> {selectedDoctor.licenseNumber}</p>
            <p><strong>Hospital / Clinic:</strong> {selectedDoctor.hospital}</p>
            <p><strong>Status:</strong> {selectedDoctor.status}</p>
            <p><strong>Submitted Date:</strong> {selectedDoctor.submittedDate}</p>
            <p><strong>Bio:</strong> {selectedDoctor.bio}</p>
          </div>
        ) : null}
      </Modal>
    </ShellLayout>
  );
}

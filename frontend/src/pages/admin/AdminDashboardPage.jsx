import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { getAdminDashboard } from '../../services/adminService';
import { adminNavItems } from '../../utils/navigation';

function CountCard({ status, count }) {
  const className =
    status === 'approved'
      ? 'badge-green'
      : status === 'rejected'
        ? 'badge-red'
        : 'badge-yellow';

  return (
    <article className="count-card card">
      <span className={className}>{status}</span>
      <strong>{count}</strong>
    </article>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);

  const adminTools = [
    {
      title: 'AI Logs',
      text: 'Inspect symptom analysis activity and admin-facing AI events.',
      route: '/admin/ai/logs'
    },
    {
      title: 'Notification Logs',
      text: 'Review outbound notification traffic and delivery records.',
      route: '/admin/notifications/logs'
    },
    {
      title: 'Telemedicine Logs',
      text: 'Monitor telemedicine session activity and audit records.',
      route: '/admin/telemedicine/logs'
    }
  ];

  const loadData = useCallback(async () => {
    const nextData = await getAdminDashboard();
    setDoctors(nextData.doctors);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const counts = useMemo(
    () => ({
      pending: doctors.filter((doctor) => doctor.status === 'pending').length,
      rejected: doctors.filter((doctor) => doctor.status === 'rejected').length,
      approved: doctors.filter((doctor) => doctor.status === 'approved').length
    }),
    [doctors]
  );

  return (
    <ShellLayout
      title="Admin Dashboard"
      subtitle="Review doctor registration progress and open the verification workflow quickly."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="Doctor Management"
        title="Review doctor registration progress"
        subtitle="Manage doctor requests, open the verification workspace, and move through admin tasks with a cleaner healthcare dashboard."
        variant="admin-dashboard"
        actions={[
          {
            label: 'Verify Doctor',
            className: 'btn btn-primary',
            onClick: () => navigate('/admin/verify-doctors')
          },
          {
            label: 'All Doctors',
            className: 'btn btn-secondary',
            onClick: () => navigate('/admin/all-doctors')
          }
        ]}
      />

      <div className="count-grid">
        <CountCard status="pending" count={counts.pending} />
        <CountCard status="rejected" count={counts.rejected} />
        <CountCard status="approved" count={counts.approved} />
      </div>

      <section className="card compact-card">
        <div className="section-heading">
          <h2>Admin Monitoring Tools</h2>
          <p>Open the platform activity pages directly from the admin dashboard.</p>
        </div>
        <div className="services-grid services-grid-compact">
          {adminTools.map((item) => (
            <button
              key={item.title}
              className="service-card service-card-reports"
              onClick={() => navigate(item.route)}
            >
              <span className="service-icon service-emoji" aria-hidden="true">📊</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </button>
          ))}
        </div>
      </section>
    </ShellLayout>
  );
}

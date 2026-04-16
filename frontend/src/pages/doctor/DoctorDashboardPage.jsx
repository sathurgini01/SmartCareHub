import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDashboard, updateAppointmentStatus } from '../../services/doctorService';

const serviceCards = [
  {
    title: 'Reports',
    text: 'View patient uploaded medical reports',
    route: '/doctor/reports',
    icon: '📄',
    accent: 'reports'
  },
  {
    title: 'Prescriptions',
    text: 'Create and review digital prescriptions',
    route: '/doctor/prescriptions',
    icon: '💊',
    accent: 'prescriptions'
  },
  {
    title: 'Appointments',
    text: 'Manage patient bookings and requests',
    route: '/doctor/appointments',
    icon: '📅',
    accent: 'appointments'
  },
  {
    title: 'Availability',
    text: 'Plan clinic and online time slots',
    route: '/doctor/availability',
    icon: '👤',
    accent: 'availability'
  }
];

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const nextData = await getDoctorDashboard(user.id);
    setData(nextData);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    if (!data) return [];

    return [
      { title: 'Total Appointments', value: data.appointments.length, icon: 'AP' },
      {
        title: 'Pending Requests',
        value: data.appointments.filter((item) => item.status === 'pending').length,
        icon: 'RQ'
      },
      { title: 'Availability Slots', value: data.availability.length, icon: 'AV' },
      { title: 'Prescriptions Issued', value: data.prescriptions.length, icon: 'RX' }
    ];
  }, [data]);

  async function handleRequest(id, status) {
    await updateAppointmentStatus(id, status);
    setMessage(`Appointment ${status} successfully.`);
    loadData();
  }

  if (loading || !data) {
    return <LoadingSpinner label="Loading doctor dashboard..." />;
  }

  return (
    <ShellLayout>
      {message ? <div className="alert-success">{message}</div> : null}

      <PageBanner
        eyebrow="Smart Healthcare Doctor Portal"
        title={`Welcome back, Dr. ${data.doctor.fullName}`}
        subtitle={`Delivering ${data.doctor.specialization} care at ${data.doctor.hospital}`}
        variant="doctor-dashboard"
      />

      <div className="stats-grid stats-grid-compact">
        {stats.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} />
        ))}
      </div>

      <section className="card compact-card">
        <div className="section-heading">
          <h2>Services For Your Health</h2>
          <p>Open doctor tools quickly from a cleaner service-style dashboard section.</p>
        </div>

        <div className="services-grid services-grid-compact">
          {serviceCards.map((item) => (
            <button
              key={item.title}
              className={`service-card service-card-${item.accent}`}
              onClick={() => navigate(item.route)}
            >
              <span className="service-icon service-emoji" aria-hidden="true">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-grid dashboard-grid-wide">
        <div className="card compact-card">
          <div className="section-heading">
            <h2>Pending Appointment Requests</h2>
            <p>Highlighted requests waiting for action from the doctor.</p>
          </div>
          <DataTable
            columns={['Patient', 'Date', 'Time', 'Reason', 'Type', 'Status', 'Action']}
            rows={data.appointments.filter((item) => item.status === 'pending')}
            emptyTitle="No pending requests"
            emptyText="New appointment requests will appear here."
            renderRow={(item) => (
              <tr key={item.id}>
                <td>{item.patientName}</td>
                <td>{item.appointmentDate}</td>
                <td>{item.time}</td>
                <td>{item.reason}</td>
                <td>{item.consultationType}</td>
                <td><Badge status={item.status} /></td>
                <td>
                  <div className="table-action-row">
                    <button className="btn btn-success btn-sm" onClick={() => handleRequest(item.id, 'confirmed')}>
                      Accept
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRequest(item.id, 'rejected')}>
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>

        <div className="card compact-card">
          <div className="section-heading">
            <h2>Recent Prescriptions</h2>
            <p>Your latest prescription activity is shown here.</p>
          </div>
          <DataTable
            columns={['Patient', 'Date', 'Diagnosis', 'Medicines']}
            rows={data.prescriptions.slice(0, 4)}
            emptyTitle="No prescriptions yet"
            emptyText="Created prescriptions will appear here."
            renderRow={(item) => (
              <tr key={item.id}>
                <td>{item.patientName}</td>
                <td>{item.date}</td>
                <td>{item.diagnosis}</td>
                <td>{item.medicines.map((medicine) => medicine.name).join(', ')}</td>
              </tr>
            )}
          />
        </div>
      </section>
    </ShellLayout>
  );
}

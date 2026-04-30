import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageBanner from '../components/common/PageBanner';
import StatCard from '../components/common/StatCard';

const serviceCards = [
  {
    title: 'Profile',
    description: 'Keep your personal and contact details current.',
    route: '/profile',
    icon: 'PR',
    accent: 'profile'
  },
  {
    title: 'Upload Reports',
    description: 'Add lab results, scans, and supporting medical documents.',
    route: '/upload-report',
    icon: 'RP',
    accent: 'reports'
  },
  {
    title: 'Prescriptions',
    description: 'Review your medicines and treatment notes in one place.',
    route: '/prescriptions',
    icon: 'RX',
    accent: 'prescriptions'
  },
  {
    title: 'Appointments',
    description: 'Manage consultation bookings and upcoming visits.',
    route: '/appointments',
    icon: 'AP',
    accent: 'appointments'
  },
  {
    title: 'Telemedicine',
    description: 'Open your online consultation history and session details.',
    route: '/patient/telemedicine',
    icon: 'TM',
    accent: 'telemedicine'
  },
  {
    title: 'Payment History',
    description: 'Check completed transactions and consultation payments.',
    route: '/payment-history',
    icon: 'PY',
    accent: 'reports'
  },
  {
    title: 'Symptom Checker',
    description: 'Get guided symptom insights before your next consultation.',
    route: '/patient/symptom-checker',
    icon: 'AI',
    accent: 'insights'
  }
];

function formatFriendlyDate(value) {
  if (!value) return 'No date available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date available';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReports: 0,
    totalPrescriptions: 0,
    upcomingAppointments: 0,
    profileStatus: 'Active'
  });
  const [recentReports, setRecentReports] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    try {
      const [reportsRes, prescriptionsRes, appointmentsRes] = await Promise.allSettled([
        api.get('/patients/reports'),
        api.get('/patients/prescriptions'),
        api.get('/appointments/my-appointments')
      ]);

      const reports =
        reportsRes.status === 'fulfilled' ? reportsRes.value.data.data || reportsRes.value.data : [];
      const prescriptions =
        prescriptionsRes.status === 'fulfilled'
          ? prescriptionsRes.value.data.data || prescriptionsRes.value.data
          : [];
      const appointmentData =
        appointmentsRes.status === 'fulfilled'
          ? appointmentsRes.value.data.data || appointmentsRes.value.data
          : [];

      setStats({
        totalReports: reports.length,
        totalPrescriptions: prescriptions.length,
        upcomingAppointments: appointmentData.filter((item) => item.status !== 'cancelled').length,
        profileStatus: 'Active'
      });

      setRecentReports(reports.slice(0, 3));
      setAppointments(appointmentData);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  }

  const profileCompletion = useMemo(() => {
    const fields = [user?.name || user?.fullName, user?.email, user?.phone, user?.address];
    const completeFields = fields.filter((value) => String(value || '').trim()).length;
    return Math.round((completeFields / fields.length) * 100);
  }, [user]);

  const nextAppointment = useMemo(() => {
    return [...appointments]
      .filter((item) => item?.status !== 'cancelled')
      .sort(
        (first, second) =>
          new Date(first.appointmentDate || first.date || 0) -
          new Date(second.appointmentDate || second.date || 0)
      )[0];
  }, [appointments]);

  const statItems = [
    {
      title: 'Medical Reports',
      value: stats.totalReports,
      icon: 'RP',
      helper: recentReports.length ? `${recentReports.length} recent uploads ready` : 'Start your medical record library'
    },
    {
      title: 'Prescriptions',
      value: stats.totalPrescriptions,
      icon: 'RX',
      helper: stats.totalPrescriptions ? 'Review current treatment guidance' : 'No prescriptions available yet'
    },
    {
      title: 'Appointments',
      value: stats.upcomingAppointments,
      icon: 'AP',
      helper: nextAppointment
        ? `Next visit ${formatFriendlyDate(nextAppointment.appointmentDate || nextAppointment.date)}`
        : 'No upcoming consultations booked'
    },
    {
      title: 'Profile Status',
      value: `${profileCompletion}%`,
      icon: 'PF',
      helper:
        profileCompletion >= 100
          ? 'Your patient profile is complete'
          : 'Add missing details for a fuller patient profile'
    }
  ];

  const displayName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'Patient';

  return (
    <div>
      <PageBanner
        eyebrow="Smart Healthcare Patient Portal"
        title={`Welcome back, ${displayName}`}
        subtitle="A more polished control center for appointments, prescriptions, reports, and digital follow-up care."
        variant="patient-dashboard"
        actions={[
          {
            label: 'Review Appointments',
            className: 'btn btn-primary',
            onClick: () => navigate('/appointments')
          }
        ]}
      />

      <div className="stats-grid stats-grid-compact">
        {statItems.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            helper={item.helper}
          />
        ))}
      </div>

      <section className="patient-dashboard-grid">
        <article className="card compact-card patient-spotlight-card">
          <div className="section-heading">
            <h2>Your Care Snapshot</h2>
            <p>Important patient details and the next best action, all in one view.</p>
          </div>

          <div className="patient-snapshot-list">
            <div className="patient-snapshot-item">
              <span>Patient email</span>
              <strong>{user?.email || 'No email available'}</strong>
            </div>
            <div className="patient-snapshot-item">
              <span>Next appointment</span>
              <strong>
                {nextAppointment
                  ? `${formatFriendlyDate(nextAppointment.appointmentDate || nextAppointment.date)}${
                      nextAppointment.time ? ` at ${nextAppointment.time}` : ''
                    }`
                  : 'No appointment booked yet'}
              </strong>
            </div>
            <div className="patient-snapshot-item">
              <span>Account status</span>
              <strong>{stats.profileStatus}</strong>
            </div>
          </div>

          <div className="patient-progress-track" aria-hidden="true">
            <span style={{ width: `${profileCompletion}%` }} />
          </div>
        </article>

        <article className="card compact-card patient-insights-card">
          <div className="section-heading">
            <h2>Health Workflow</h2>
            <p>Recommended next steps to keep your care journey organized.</p>
          </div>

          <div className="patient-insight-list">
            <div className="patient-insight-item">
              <strong>{stats.totalReports ? 'Reports are available' : 'Upload your first report'}</strong>
              <p>
                {stats.totalReports
                  ? 'Your medical documents are ready to reference before future consultations.'
                  : 'Adding prior records helps doctors prepare faster for upcoming visits.'}
              </p>
            </div>
            <div className="patient-insight-item">
              <strong>{stats.upcomingAppointments ? 'Appointments are on track' : 'Schedule a consultation'}</strong>
              <p>
                {stats.upcomingAppointments
                  ? 'You already have active care booked and visible from this dashboard.'
                  : 'Browse doctors and reserve a suitable time slot when you are ready.'}
              </p>
            </div>
            <div className="patient-insight-item">
              <strong>
                {stats.totalPrescriptions
                  ? 'Medication history is ready'
                  : 'Prescription updates will appear here'}
              </strong>
              <p>
                {stats.totalPrescriptions
                  ? 'Review medicine instructions before your next in-person or online session.'
                  : 'Once your doctor issues treatment, it will be visible directly in your dashboard.'}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="card compact-card">
        <div className="section-heading">
          <h2>Quick Actions</h2>
          <p>Open the most important patient tools from a cleaner, more service-focused dashboard.</p>
        </div>

        <div className="services-grid services-grid-compact">
          {serviceCards.map((item) => (
            <Link key={item.title} to={item.route} className={`service-card service-card-${item.accent}`}>
              <span className="service-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {recentReports.length > 0 && (
        <section className="card compact-card" style={{ marginTop: '2rem' }}>
          <div className="section-heading">
            <h2>Recent Reports</h2>
            <p>Your latest uploads, ready to reference before your next consultation.</p>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Description</th>
                  <th>Uploaded On</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, idx) => (
                  <tr key={idx}>
                    <td>{report.fileName || report.originalName}</td>
                    <td>{report.description || 'Medical Report'}</td>
                    <td>{formatFriendlyDate(report.uploadedAt || report.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

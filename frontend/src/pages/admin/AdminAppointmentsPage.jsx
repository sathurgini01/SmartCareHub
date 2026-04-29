import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX } from 'react-icons/fi';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { adminNavItems } from '../../utils/navigation';
import appointmentService from '../../services/appointmentService';
import { formatCurrency, formatDate, formatTime, getStatusBadge } from '../../utils/formatters';
import '../AdminDashboard.css';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [aptStats, setAptStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.adminGetAll({ limit: 100 });
      if (res.data.success) {
        setAppointments(res.data.data);
        setAptStats(res.data.stats || {});
      }
    } catch (err) {
      console.error('Admin appointments load error:', err);
      toast.error('Failed to load appointments');
    }
    setLoading(false);
  };

  const handleCancelAppointment = async (id) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;
    try {
      await appointmentService.adminCancel(id, reason);
      toast.success('Appointment cancelled');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  return (
    <ShellLayout
      title="All Appointments"
      subtitle="View and manage all appointments across the SmartCareHub platform."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="Appointments Management"
        title="Manage Platform Appointments"
        subtitle="View all scheduled consultations and perform administrative actions like forced cancellations."
        variant="admin-dashboard"
        actions={[
          {
            label: 'Refresh Data',
            className: 'btn btn-primary',
            onClick: loadData
          }
        ]}
      />

      {Object.keys(aptStats).length > 0 && (
        <div className="count-grid" style={{ marginBottom: '24px' }}>
          {Object.entries(aptStats).map(([status, count]) => (
            <article key={status} className="count-card card">
              <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
              <strong>{count}</strong>
            </article>
          ))}
        </div>
      )}

      <div className="admin-table-container">
        {loading ? (
          <div className="spinner-overlay" style={{ minHeight: '300px' }}><div className="spinner"></div></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No appointments found</td></tr>
                ) : appointments.map(apt => (
                  <tr key={apt._id}>
                    <td className="ref-cell">{apt.appointmentNumber}</td>
                    <td><strong>{apt.patientName}</strong><br/><span className="sub-text">{apt.patientEmail}</span></td>
                    <td>{apt.doctorName}<br/><span className="sub-text">{apt.specialty}</span></td>
                    <td>{formatDate(apt.appointmentDate)}<br/><span className="sub-text">{formatTime(apt.timeSlot?.start)} - {formatTime(apt.timeSlot?.end)}</span></td>
                    <td className="amount-cell">{formatCurrency(apt.consultationFee, apt.currency)}</td>
                    <td><span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span></td>
                    <td><span className={`badge ${getStatusBadge(apt.paymentStatus)}`}>{apt.paymentStatus}</span></td>
                    <td>
                      {!['cancelled', 'completed'].includes(apt.status) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelAppointment(apt._id)}>
                          <FiX size={12} style={{ marginRight: '4px' }} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ShellLayout>
  );
}

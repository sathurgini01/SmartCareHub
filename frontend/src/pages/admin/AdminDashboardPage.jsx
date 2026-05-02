import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { getAdminDashboard } from '../../services/adminService';
import { adminNavItems } from '../../utils/navigation';
import '../AdminDashboard.css';
import { getAllPatients } from '../../services/patientAdminService';
import { toast } from 'react-toastify';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patientCount, setPatientCount] = useState(null);

  const loadData = useCallback(async () => {
    const nextData = await getAdminDashboard();
    setDoctors(nextData.doctors);
    try {
      const { data } = await getAllPatients();
      setPatientCount(data.length);
    } catch (err) {
      console.error('Failed to load patient count', err);
      toast.error('Could not load patient statistics');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ShellLayout
      title="Admin Dashboard"
      subtitle="Centralized control for SmartCareHub platform."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="System Overview"
        title="Admin Control Center"
        subtitle="Manage users, monitor platform health, handle appointments, and track revenue from a single centralized dashboard."
        variant="admin-dashboard"
      />

      <div style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px', color: '#f1f5f9' }}>Platform Management</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="card" style={{ flex: '1', minWidth: '250px', padding: '24px' }}>
            <h4 style={{ marginBottom: '8px', color: '#fff' }}>Appointments</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              View all patient appointments, check status, and force-cancel if necessary.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/appointments')} style={{ width: '100%' }}>
              Manage Appointments
            </button>
          </div>

          <div className="card" style={{ flex: '1', minWidth: '250px', padding: '24px' }}>
            <h4 style={{ marginBottom: '8px', color: '#fff' }}>Payments & Revenue</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              Track platform revenue, monitor transactions, and issue refunds.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/payments')} style={{ width: '100%' }}>
              Manage Payments
            </button>
          </div>

          <div className="card" style={{ flex: '1', minWidth: '250px', padding: '24px' }}>
            <h4 style={{ marginBottom: '8px', color: '#fff' }}>Patient Management</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              Create, edit, or delete patient profiles. Quickly see how many patients are registered.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/patient-management')} style={{ width: '100%' }}>
              Manage Patients
            </button>
            {patientCount !== null && (
              <div style={{ marginTop: '12px', color: '#a7f3d0', fontSize: '0.85rem' }}>
                Total patients: <strong>{patientCount}</strong>
              </div>
            )}
          </div>

          <div className="card" style={{ flex: '1', minWidth: '250px', padding: '24px' }}>
            <h4 style={{ marginBottom: '8px', color: '#fff' }}>Doctor Management</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              Verify new registrations, manage doctor profiles, and review approval queues.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/admin/doctor-management')} style={{ width: '100%' }}>
              Manage Doctors
            </button>
            {doctors && doctors.length > 0 && (
              <div style={{ marginTop: '12px', color: '#a7f3d0', fontSize: '0.85rem' }}>
                Total doctors: <strong>{doctors.length}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}

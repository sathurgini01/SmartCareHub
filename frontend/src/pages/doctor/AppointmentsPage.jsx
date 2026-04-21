import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import {
  deleteAppointmentRequest,
  getDoctorDashboard,
  updateAppointmentStatus
} from '../../services/doctorService';
import { doctorNavItems } from '../../utils/navigation';
import { formatDate } from '../../utils/formatters';
import { FiVideo } from 'react-icons/fi';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  const loadData = useCallback(async () => {
    const data = await getDoctorDashboard(user.id);
    setAppointments(data.appointments);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (appointmentId) => {
    await deleteAppointmentRequest(appointmentId);
    loadData();
  };

  return (
    <ShellLayout
      title="Appointment Request Management"
      subtitle="Accept or reject pending requests, then continue approved consultations through telemedicine."
      navItems={doctorNavItems}
    >
      <PageBanner
        eyebrow="Appointment Queue"
        title="Patient request handling"
        subtitle="Review consultation requests, approve bookings, and open telemedicine sessions for accepted appointments."
        variant="appointments"
      />
      <section className="card">
        <div className="section-heading">
          <h2>Appointment Request List</h2>
          <p>Pending requests show accept/reject actions. Processed requests keep only follow-up actions.</p>
        </div>
        <DataTable
          columns={['Patient', 'Appointment Date', 'Time', 'Reason', 'Type', 'Status', 'Action']}
          rows={appointments}
          emptyTitle="No appointment requests"
          emptyText="Appointment requests will appear here."
          renderRow={(item) => (
            <tr key={item.id} className={item.status === 'pending' ? 'table-highlight' : ''}>
              <td>{item.patientName}</td>
              <td>{formatDate(item.appointmentDate)}</td>
              <td>{item.time}</td>
              <td>{item.reason}</td>
              <td>{item.consultationType}</td>
              <td><Badge status={item.status} /></td>
              <td>
                <div className="button-row">
                  {item.status === 'pending' ? (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => updateAppointmentStatus(item.id, 'confirmed').then(loadData)}>
                        Accept
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateAppointmentStatus(item.id, 'rejected').then(loadData)}>
                        Reject
                      </button>
                    </>
                  ) : null}
                  {(item.status === 'confirmed' || item.status === 'rescheduled') ? (
                    <button className="btn btn-blue btn-sm" onClick={() => navigate(`/doctor/telemedicine/${item.id}`)}>
                      <FiVideo /> Telemedicine
                    </button>
                  ) : null}
                  {item.status !== 'pending' ? (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          )}
        />
      </section>
    </ShellLayout>
  );
}

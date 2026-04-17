import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import {
  getDoctorDashboard,
  rescheduleAppointment,
  updateAppointmentStatus
} from '../../services/doctorService';
import { doctorNavItems } from '../../utils/navigation';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const loadData = useCallback(async () => {
    const data = await getDoctorDashboard(user.id);
    setAppointments(data.appointments);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ShellLayout
      title="Appointment Request Management"
      subtitle="Accept, reject, review details, and reschedule patient appointments."
      navItems={doctorNavItems}
    >
      <PageBanner
        eyebrow="Appointment Queue"
        title="Patient request handling"
        subtitle="Review consultation requests, approve bookings, and reschedule patient time slots neatly."
        variant="appointments"
      />
      <section className="card">
        <div className="section-heading">
          <h2>Appointment Request List</h2>
          <p>Pending requests are highlighted and every action is clickable.</p>
        </div>
        <DataTable
          columns={['Patient', 'Appointment Date', 'Time', 'Reason', 'Type', 'Status', 'Action']}
          rows={appointments}
          emptyTitle="No appointment requests"
          emptyText="Appointment requests will appear here."
          renderRow={(item) => (
            <tr key={item.id} className={item.status === 'pending' ? 'table-highlight' : ''}>
              <td>{item.patientName}</td>
              <td>{item.appointmentDate}</td>
              <td>{item.time}</td>
              <td>{item.reason}</td>
              <td>{item.consultationType}</td>
              <td><Badge status={item.status} /></td>
              <td>
                <div className="button-row">
                  <button className="btn btn-success btn-sm" onClick={() => updateAppointmentStatus(item.id, 'confirmed').then(loadData)}>
                    Accept
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateAppointmentStatus(item.id, 'rejected').then(loadData)}>
                    Reject
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelected(item)}>
                    View Details
                  </button>
                  {(item.status === 'confirmed' || item.status === 'rescheduled') ? (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/doctor/telemedicine')}>
                      Telemedicine Session
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          )}
        />
      </section>

      <Modal title="Appointment Details" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="modal-content-grid">
            <p><strong>Patient:</strong> {selected.patientName}</p>
            <p><strong>Reason:</strong> {selected.reason}</p>
            <p><strong>Consultation Type:</strong> {selected.consultationType}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <FormSection
              rescheduleDate={rescheduleDate}
              setRescheduleDate={setRescheduleDate}
              rescheduleTime={rescheduleTime}
              setRescheduleTime={setRescheduleTime}
              onReschedule={() =>
                rescheduleAppointment(selected.id, rescheduleDate, rescheduleTime).then(() => {
                  setSelected(null);
                  loadData();
                })
              }
            />
          </div>
        ) : null}
      </Modal>
    </ShellLayout>
  );
}

function FormSection({
  rescheduleDate,
  setRescheduleDate,
  rescheduleTime,
  setRescheduleTime,
  onReschedule
}) {
  return (
    <div className="reschedule-box">
      <h3>Reschedule</h3>
      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Date</span>
          <input className="form-input" type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
        </label>
        <label className="form-field">
          <span className="form-label">Time</span>
          <input className="form-input" type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
        </label>
      </div>
      <button className="btn btn-primary" onClick={onReschedule}>
        Reschedule
      </button>
    </div>
  );
}

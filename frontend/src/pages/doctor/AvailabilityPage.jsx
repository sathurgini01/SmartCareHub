import { useCallback, useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import FormInput from '../../components/common/FormInput';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import {
  deleteAvailability,
  getDoctorDashboard,
  saveAvailability
} from '../../services/doctorService';
import { doctorNavItems } from '../../utils/navigation';

const emptySlot = {
  date: '',
  startTime: '',
  endTime: '',
  consultationType: 'Online',
  location: ''
};

export default function AvailabilityPage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [slot, setSlot] = useState(emptySlot);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const loadData = useCallback(async () => {
    const data = await getDoctorDashboard(user.id);
    setAvailability(data.availability);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit() {
    try {
      await saveAvailability(user.id, slot, editingId);
      setAlert({ type: 'success', message: editingId ? 'Slot updated.' : 'Slot added.' });
      setSlot(emptySlot);
      setEditingId(null);
      loadData();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  }

  return (
    <ShellLayout
      title="Availability Management"
      subtitle="Build a realistic doctor scheduling workflow with overlap prevention."
      navItems={doctorNavItems}
    >
      <PageBanner
        eyebrow="Schedule Management"
        title="Manage doctor availability"
        subtitle="Create clear online and physical consultation slots with better schedule control."
        variant="availability"
      />
      {alert ? <div className={alert.type === 'error' ? 'alert-error' : 'alert-success'}>{alert.message}</div> : null}

      <section className="card">
        <div className="section-heading">
          <h2>Add New Availability Slot</h2>
          <p>Choose date, time, consultation type, and location.</p>
        </div>
        <div className="form-grid">
          <FormInput label="Date" type="date" value={slot.date} onChange={(e) => setSlot({ ...slot, date: e.target.value })} />
          <FormInput label="Start Time" type="time" value={slot.startTime} onChange={(e) => setSlot({ ...slot, startTime: e.target.value })} />
          <FormInput label="End Time" type="time" value={slot.endTime} onChange={(e) => setSlot({ ...slot, endTime: e.target.value })} />
          <FormInput label="Consultation Type" as="select" value={slot.consultationType} onChange={(e) => setSlot({ ...slot, consultationType: e.target.value })}>
            <option>Online</option>
            <option>Physical</option>
            <option>Both</option>
          </FormInput>
          <FormInput label="Location" value={slot.location} onChange={(e) => setSlot({ ...slot, location: e.target.value })} />
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingId ? 'Update Slot' : 'Add Slot'}
          </button>
          <button className="btn btn-secondary" onClick={() => { setEditingId(null); setSlot(emptySlot); }}>
            Clear
          </button>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <h2>Availability Table</h2>
          <p>Professional schedule list for online and physical consultations.</p>
        </div>
        <DataTable
          columns={['Date', 'Start', 'End', 'Type', 'Location', 'Status', 'Actions']}
          rows={availability}
          emptyTitle="No availability configured"
          emptyText="Add your first slot to start receiving bookings."
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.startTime}</td>
              <td>{item.endTime}</td>
              <td>{item.consultationType}</td>
              <td>{item.location}</td>
              <td><span className="badge-green">{item.status}</span></td>
              <td>
                <div className="button-row">
                  <button className="btn btn-secondary" onClick={() => { setEditingId(item.id); setSlot(item); }}>
                    Edit
                  </button>
                  <button className="btn btn-secondary" onClick={() => deleteAvailability(item.id).then(loadData)}>
                    Delete
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

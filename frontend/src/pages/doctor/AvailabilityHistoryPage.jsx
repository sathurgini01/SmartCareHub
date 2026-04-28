import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import DoctorPageIntro from '../../components/doctor/DoctorPageIntro';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDashboard } from '../../services/doctorService';
import { doctorNavItems } from '../../utils/navigation';
import { formatDate } from '../../utils/formatters';

export default function AvailabilityHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);

  const loadData = useCallback(async () => {
    const data = await getDoctorDashboard(user.id);
    setAvailability(data.availability);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ShellLayout
      title="Availability History"
      subtitle="Review all saved availability slots from one page."
      navItems={doctorNavItems}
    >
      <DoctorPageIntro
        eyebrow="Availability History"
        title="Saved availability details"
        subtitle="View every online and physical consultation slot that has been created."
        image="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80"
        stats={[
          { label: 'Total slots', value: availability.length },
          { label: 'Open slots', value: availability.filter((item) => item.status === 'Open').length },
          { label: 'Online slots', value: availability.filter((item) => item.consultationType === 'Online').length }
        ]}
      />

      <section className="card">
        <div className="section-heading section-heading-split">
          <div>
            <h2>Availability Detail List</h2>
            <p>Full list of saved doctor schedule entries.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/doctor/availability')}>
            Back to Availability Form
          </button>
        </div>

        <DataTable
          columns={['Date', 'Start', 'End', 'Type', 'Location', 'Status']}
          rows={availability}
          emptyTitle="No availability history"
          emptyText="Saved availability slots will appear here."
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{formatDate(item.date)}</td>
              <td>{item.startTime}</td>
              <td>{item.endTime}</td>
              <td>{item.consultationType}</td>
              <td>{item.location}</td>
              <td><span className="badge-green">{item.status}</span></td>
            </tr>
          )}
        />
      </section>
    </ShellLayout>
  );
}

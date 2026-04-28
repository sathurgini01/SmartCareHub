import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import DoctorPageIntro from '../../components/doctor/DoctorPageIntro';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import { getDoctorDashboard } from '../../services/doctorService';
import { doctorNavItems } from '../../utils/navigation';
import { formatDate } from '../../utils/formatters';

export default function PrescriptionListDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const loadData = useCallback(async () => {
    const data = await getDoctorDashboard(user.id);
    setHistory(data.prescriptions);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <ShellLayout
      title="Prescription List Details"
      subtitle="Open saved prescription records and review each patient prescription in detail."
      navItems={doctorNavItems}
    >
      <DoctorPageIntro
        eyebrow="Prescription Records"
        title="Saved prescription details"
        subtitle="Review patient prescriptions, medicines, and diagnosis notes from one detail page."
        image="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80"
        stats={[
          { label: 'Total prescriptions', value: history.length },
          { label: 'Unique patients', value: new Set(history.map((item) => item.patientId || item.patientName)).size },
          { label: 'Medicine records', value: history.reduce((sum, item) => sum + item.medicines.length, 0) }
        ]}
      />

      <section className="card">
        <div className="section-heading section-heading-split">
          <div>
            <h2>Prescription List</h2>
            <p>Open full prescription details for each patient record.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/doctor/prescriptions')}>
            Back to Prescription Form
          </button>
        </div>

        <DataTable
          columns={['Patient', 'Date', 'Diagnosis', 'Medicines', 'Actions']}
          rows={history}
          emptyTitle="No prescriptions yet"
          emptyText="Saved prescriptions will appear here."
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.patientName}</td>
              <td>{formatDate(item.date)}</td>
              <td>{item.diagnosis}</td>
              <td>{item.medicines.map((medicine) => medicine.name).join(', ')}</td>
              <td>
                <button className="btn btn-blue btn-sm" onClick={() => setSelectedPrescription(item)}>
                  View Details
                </button>
              </td>
            </tr>
          )}
        />
      </section>

      <Modal
        title="Prescription Details"
        open={Boolean(selectedPrescription)}
        onClose={() => setSelectedPrescription(null)}
      >
        {selectedPrescription ? (
          <div className="modal-content-grid">
            <div className="admin-detail-card">
              <span>Patient</span>
              <strong>{selectedPrescription.patientName}</strong>
            </div>
            <div className="admin-detail-card">
              <span>Date</span>
              <strong>{formatDate(selectedPrescription.date)}</strong>
            </div>
            <div className="admin-detail-card admin-detail-card-wide">
              <span>Diagnosis</span>
              <strong>{selectedPrescription.diagnosis || 'No diagnosis added.'}</strong>
            </div>
            <div className="admin-detail-card admin-detail-card-wide">
              <span>Medicines</span>
              <strong>{selectedPrescription.medicines.map((medicine) => `${medicine.name} - ${medicine.dosage} - ${medicine.frequency}`).join(', ') || 'No medicines added.'}</strong>
            </div>
            <div className="admin-detail-card admin-detail-card-wide">
              <span>Notes</span>
              <strong>{selectedPrescription.notes || 'No additional notes.'}</strong>
            </div>
            <div className="admin-detail-card">
              <span>Follow-up Date</span>
              <strong>{selectedPrescription.followUpDate ? formatDate(selectedPrescription.followUpDate) : 'Not set'}</strong>
            </div>
          </div>
        ) : null}
      </Modal>
    </ShellLayout>
  );
}

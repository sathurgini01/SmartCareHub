import { useCallback, useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import FormInput from '../../components/common/FormInput';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import {
  deletePrescription,
  getDoctorDashboard,
  savePrescription
} from '../../services/doctorService';
import { doctorNavItems } from '../../utils/navigation';

const blankMedicine = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
const emptyPrescription = {
  patientId: '',
  patientName: '',
  date: '',
  diagnosis: '',
  medicines: [{ ...blankMedicine }],
  notes: '',
  followUpDate: ''
};

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState(emptyPrescription);
  const [editingId, setEditingId] = useState(null);

  const loadData = useCallback(async () => {
    const data = await getDoctorDashboard(user.id);
    setHistory(data.prescriptions);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateMedicine(index, key, value) {
    setForm((current) => ({
      ...current,
      medicines: current.medicines.map((medicine, itemIndex) =>
        itemIndex === index ? { ...medicine, [key]: value } : medicine
      )
    }));
  }

  async function handleSubmit() {
    await savePrescription(user.id, form, editingId);
    setForm(emptyPrescription);
    setEditingId(null);
    loadData();
  }

  return (
    <ShellLayout
      title="Digital Prescription UI"
      subtitle="Create polished prescriptions with repeatable medicine rows and history tracking."
      navItems={doctorNavItems}
    >
      <PageBanner
        eyebrow="Prescription Desk"
        title="Digital prescription management"
        subtitle="Prepare a polished prescription with medicine rows, diagnosis notes, follow-up tracking, and history."
        variant="prescriptions"
      />
      <section className="card">
        <div className="section-heading">
          <h2>Prescription Creation</h2>
          <p>Professional medical form with preview-ready structure.</p>
        </div>
        <div className="form-grid">
          <FormInput label="Patient ID" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} />
          <FormInput label="Patient Name" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
          <FormInput label="Doctor ID" value={user.id} readOnly />
          <FormInput label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <FormInput
            className="field-span-2"
            label="Symptoms / Diagnosis"
            as="textarea"
            value={form.diagnosis}
            onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
          />
        </div>

        <div className="medicine-stack">
          {form.medicines.map((medicine, index) => (
            <div key={index} className="card medicine-card">
              <div className="form-grid">
                <FormInput label="Medicine Name" value={medicine.name} onChange={(e) => updateMedicine(index, 'name', e.target.value)} />
                <FormInput label="Dosage" value={medicine.dosage} onChange={(e) => updateMedicine(index, 'dosage', e.target.value)} />
                <FormInput label="Frequency" value={medicine.frequency} onChange={(e) => updateMedicine(index, 'frequency', e.target.value)} />
                <FormInput label="Duration" value={medicine.duration} onChange={(e) => updateMedicine(index, 'duration', e.target.value)} />
                <FormInput
                  className="field-span-2"
                  label="Instructions"
                  value={medicine.instructions}
                  onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="button-row">
          <button className="btn btn-secondary" onClick={() => setForm((current) => ({ ...current, medicines: [...current.medicines, { ...blankMedicine }] }))}>
            Add Medicine Row
          </button>
        </div>

        <div className="form-grid">
          <FormInput className="field-span-2" label="Additional Notes" as="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <FormInput label="Follow-up Date" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingId ? 'Save Prescription' : 'Save Prescription'}
          </button>
          <button className="btn btn-secondary">Preview</button>
          <button className="btn btn-secondary">Download PDF</button>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <h2>Prescription History</h2>
        </div>
        <DataTable
          columns={['Patient', 'Date', 'Diagnosis', 'Medicines', 'Actions']}
          rows={history}
          emptyTitle="No prescriptions yet"
          emptyText="Saved prescriptions will appear here."
          renderRow={(item) => (
            <tr key={item.id}>
              <td>{item.patientName}</td>
              <td>{item.date}</td>
              <td>{item.diagnosis}</td>
              <td>{item.medicines.map((medicine) => medicine.name).join(', ')}</td>
              <td>
                <div className="button-row">
                  <button className="btn btn-secondary" onClick={() => { setEditingId(item.id); setForm(item); }}>
                    Edit
                  </button>
                  <button className="btn btn-secondary" onClick={() => deletePrescription(item.id).then(loadData)}>
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

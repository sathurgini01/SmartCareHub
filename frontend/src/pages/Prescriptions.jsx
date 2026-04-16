import React, { useEffect, useState } from 'react';
import { getPrescriptions } from '../api/patientApi';

const mockData = [
  { id: 1, date: '2024-04-01', doctor: 'Dr. Smith', medicine: 'Amoxicillin', status: 'Active' },
  { id: 2, date: '2024-03-15', doctor: 'Dr. Lee', medicine: 'Ibuprofen', status: 'Completed' },
];

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  useEffect(() => {
    getPrescriptions()
      .then(res => setPrescriptions(res.data))
      .catch(() => setPrescriptions(mockData));
  }, []);
  return (
    <div className="card" style={{ maxWidth: 800, margin: '40px auto', padding: '2rem', color: '#fff' }}>
      <h2>Prescriptions</h2>
      <div className="table-wrap">
        <table style={{ width: '100%', color: '#fff' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Doctor</th>
              <th>Medicine</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td>{p.doctor}</td>
                <td>{p.medicine}</td>
                <td>
                  <span className={`badge-${p.status === 'Active' ? 'green' : 'yellow'}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Prescriptions;

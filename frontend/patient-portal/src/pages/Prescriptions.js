import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/api/patients/prescriptions');
      setPrescriptions(response.data);
    } catch (error) {
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  return (
    <div className="prescriptions">
      <h1>Prescriptions</h1>
      <div className="card">
        <h2>Your Prescriptions</h2>
        {prescriptions.length === 0 ? (
          <div className="alert-success">No prescriptions found.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Doctor</th>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td>{prescription.id}</td>
                    <td>{prescription.doctorName}</td>
                    <td>{prescription.medication}</td>
                    <td>{prescription.dosage}</td>
                    <td>{new Date(prescription.issuedDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge-${prescription.status === 'active' ? 'green' : 'red'}`}>
                        {prescription.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
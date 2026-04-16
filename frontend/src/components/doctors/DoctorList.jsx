import React from 'react';
import DoctorCard from './DoctorCard';

const DoctorList = ({ doctors }) => {
  if (!doctors || doctors.length === 0) return <div className="empty-state"><h3>No doctors found</h3></div>;
  return (
    <div className="doctors-grid stagger-children">
      {doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
    </div>
  );
};
export default DoctorList;

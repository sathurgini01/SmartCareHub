import Badge from '../common/Badge';

export default function DoctorReviewPanel({ doctor, onStatusChange }) {
  return (
    <div className="review-panel">
      <div className="review-profile">
        <div className="review-avatar">{doctor.fullName.slice(0, 2).toUpperCase()}</div>
        <div>
          <h3>{doctor.fullName}</h3>
          <p>{doctor.email}</p>
          <Badge status={doctor.status} />
        </div>
      </div>

      <div className="review-grid">
        <span>Specialization: {doctor.specialization}</span>
        <span>License: {doctor.licenseNumber}</span>
        <span>Experience: {doctor.experience} years</span>
        <span>Hospital: {doctor.hospital}</span>
      </div>

      <div className="button-row">
        <button className="btn btn-success btn-sm" onClick={() => onStatusChange(doctor.id, 'approved')}>
          Approve
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onStatusChange(doctor.id, 'rejected')}>
          Reject
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => onStatusChange(doctor.id, 'suspended')}>
          Suspend
        </button>
      </div>
    </div>
  );
}

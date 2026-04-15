import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, getSpecialtyIcon } from '../../utils/formatters';
import { FiStar, FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';

const DoctorCard = ({ doctor }) => (
  <div className="doctor-card card animate-fadeIn">
    <div className="doctor-card-header">
      <div className="doctor-avatar-lg">
        {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
      </div>
      <div className="doctor-header-info">
        <h3>{doctor.name}</h3>
        <p className="doctor-specialty">
          {getSpecialtyIcon(doctor.specialty)} {doctor.specialty}
        </p>
      </div>
      <div className="doctor-rating">
        <FiStar className="star-icon" />
        <span>{doctor.rating.toFixed(1)}</span>
        <span className="review-count">({doctor.totalReviews})</span>
      </div>
    </div>
    <div className="doctor-details">
      <div className="detail-item"><FiMapPin size={14} /> <span>{doctor.hospital}</span></div>
      <div className="detail-item"><FiClock size={14} /> <span>{doctor.experience} years experience</span></div>
    </div>
    <p className="doctor-bio">{doctor.bio}</p>
    <div className="doctor-qualifications">
      {doctor.qualifications.map((q, i) => <span key={i} className="qual-tag">{q}</span>)}
    </div>
    <div className="doctor-card-footer">
      <div className="doctor-fee">
        <span className="fee-label">Consultation</span>
        <span className="fee-amount">{formatCurrency(doctor.consultationFee)}</span>
      </div>
      <Link to={`/book/${doctor._id}`} className="btn btn-primary">Book Now <FiArrowRight /></Link>
    </div>
  </div>
);
export default DoctorCard;

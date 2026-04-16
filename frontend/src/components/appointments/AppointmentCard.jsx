import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, formatCurrency, getStatusBadge, getSpecialtyIcon } from '../../utils/formatters';
import { FiCalendar, FiClock, FiX, FiCreditCard } from 'react-icons/fi';
import AppointmentStatus from './AppointmentStatus';

const AppointmentCard = ({ apt, handleCancel }) => {
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  return (
    <div className="appointment-card card animate-fadeIn">
      <div className="apt-card-left">
        <div className="apt-date-block">
          <span className="apt-date-day">{new Date(apt.appointmentDate).getDate()}</span>
          <span className="apt-date-month">{new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}</span>
        </div>
      </div>
      <div className="apt-card-content">
        <div className="apt-card-top">
          <div>
            <h3>{apt.doctorName}</h3>
            <p className="apt-specialty">{getSpecialtyIcon(apt.specialty)} {apt.specialty}</p>
          </div>
          <div className="apt-badges">
            <AppointmentStatus status={apt.status} />
            <span className={`badge ${getStatusBadge(apt.paymentStatus)}`}>{apt.paymentStatus}</span>
          </div>
        </div>
        <div className="apt-card-details">
          <span><FiCalendar size={13} /> {formatDate(apt.appointmentDate)}</span>
          <span><FiClock size={13} /> {formatTime(apt.timeSlot.start)} - {formatTime(apt.timeSlot.end)}</span>
          <span className="apt-fee">{formatCurrency(apt.consultationFee)}</span>
        </div>
        {apt.reason && <p className="apt-reason">Reason: {apt.reason}</p>}
        {apt.appointmentNumber && <p className="apt-ref">Ref: {apt.appointmentNumber}</p>}
        <div className="apt-card-actions">
          {apt.paymentStatus === 'unpaid' && apt.status !== 'cancelled' && (
            <Link to={`/payment/${apt._id}`} className="btn btn-primary btn-sm"><FiCreditCard /> Pay Now</Link>
          )}
          {!['completed', 'cancelled'].includes(apt.status) && (
            <button className="btn btn-danger btn-sm" onClick={() => setCancelId(cancelId === apt._id ? null : apt._id)}><FiX /> Cancel</button>
          )}
        </div>
        {cancelId === apt._id && (
          <div className="cancel-form animate-slideDown">
            <input type="text" className="form-input" placeholder="Reason for cancellation..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <button className="btn btn-danger btn-sm" onClick={() => { handleCancel(apt._id, cancelReason); setCancelId(null); setCancelReason(''); }}>Confirm Cancel</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setCancelId(null); setCancelReason(''); }}>Dismiss</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AppointmentCard;

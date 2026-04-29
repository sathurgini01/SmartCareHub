import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiCreditCard, FiSearch, FiVideo, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getSpecialtyIcon,
  getStatusBadge,
} from '../utils/formatters';
import './MyAppointments.css';

const FILTERS = ['', 'pending', 'confirmed', 'rejected', 'rescheduled', 'completed', 'cancelled'];

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;

      const res = await appointmentService.getMyAppointments(params);
      setAppointments(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load appointment history:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id) => {
    if (!cancelReason.trim()) {
      toast.warning('Please provide a reason');
      return;
    }

    try {
      await appointmentService.cancel(id, cancelReason);
      toast.success('Appointment cancelled');
      setCancelId(null);
      setCancelReason('');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const renderTime = (appointment) => {
    if (appointment.timeSlot?.start) {
      return `${formatTime(appointment.timeSlot.start)} - ${formatTime(appointment.timeSlot.end)}`;
    }

    return appointment.time || 'Not available';
  };

  const canPay = (appointment) =>
    ['pending', 'confirmed'].includes(appointment.status) &&
    (appointment.paymentStatus || 'unpaid') === 'unpaid';

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="appointments my-appointments">
      <div
        className="page-header animate-slideUp"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Appointment History</h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            View appointment details, payment status, and booking actions in one place.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '4px 14px',
              color: '#94a3b8',
              fontSize: '0.9rem',
            }}
          >
            {appointments.length} record{appointments.length !== 1 ? 's' : ''}
          </span>
          <Link to="/doctors" className="btn btn-primary">
            <FiSearch /> Make Appointment
          </Link>
        </div>
      </div>

      <div className="appointments-filters animate-fadeIn">
        {FILTERS.map((status) => (
          <button
            key={status || 'all'}
            className={`filter-chip ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
            type="button"
          >
            {status || 'All'}{status && <span className="chip-dot" />}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '12px', fontWeight: 800, color: '#94a3b8' }}>
            AP
          </div>
          <h3>No appointments found</h3>
          <p>Choose a doctor and the booking form will open from the doctor details page.</p>
          <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Make Appointment
          </Link>
        </div>
      ) : (
        <div className="appointments-list stagger-children">
          {appointments.map((appointment) => (
            <div key={appointment._id || appointment.id} className="appointment-card card animate-fadeIn">
              <div className="apt-card-left">
                <div className="apt-date-block">
                  <span className="apt-date-day">
                    {appointment.appointmentDate ? new Date(appointment.appointmentDate).getDate() : '--'}
                  </span>
                  <span className="apt-date-month">
                    {appointment.appointmentDate
                      ? new Date(appointment.appointmentDate).toLocaleString('default', { month: 'short' })
                      : 'Date'}
                  </span>
                </div>
              </div>

              <div className="apt-card-content">
                <div className="apt-card-top">
                  <div>
                    <h3>{appointment.doctorName || 'Doctor appointment'}</h3>
                    <p className="apt-specialty">
                      {getSpecialtyIcon(appointment.specialty)} {appointment.specialty || 'General Medicine'}
                    </p>
                  </div>
                  <div className="apt-badges">
                    <span className={`badge ${getStatusBadge(appointment.status)}`}>
                      {appointment.status || 'pending'}
                    </span>
                    <span className={`badge ${getStatusBadge(appointment.paymentStatus || 'unpaid')}`}>
                      {appointment.paymentStatus || 'unpaid'}
                    </span>
                  </div>
                </div>

                <div className="apt-card-details">
                  <span><FiCalendar size={13} /> {formatDate(appointment.appointmentDate)}</span>
                  <span><FiClock size={13} /> {renderTime(appointment)}</span>
                  <span className="apt-fee">
                    {formatCurrency(appointment.consultationFee || 0, appointment.currency || 'LKR')}
                  </span>
                </div>

                {appointment.reason && <p className="apt-reason">Reason: {appointment.reason}</p>}
                {appointment.notes && <p className="apt-reason">Notes: {appointment.notes}</p>}
                {appointment.appointmentNumber && <p className="apt-ref">Ref: {appointment.appointmentNumber}</p>}

                <div className="apt-card-actions">
                  {canPay(appointment) && (
                    <Link to={`/payment/${appointment._id || appointment.id}`} className="btn btn-primary btn-sm">
                      <FiCreditCard /> Pay Now
                    </Link>
                  )}
                  {appointment.status === 'confirmed' && (
                    <Link to={`/patient/telemedicine/${appointment._id || appointment.id}`} className="btn btn-blue btn-sm">
                      <FiVideo /> Telemedicine
                    </Link>
                  )}
                  {!['completed', 'cancelled', 'rejected'].includes(appointment.status) && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setCancelId(cancelId === appointment._id ? null : appointment._id)}
                    >
                      <FiX /> Cancel
                    </button>
                  )}
                </div>

                {cancelId === appointment._id && (
                  <div className="cancel-form animate-slideDown">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Reason for cancellation..."
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                    />
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appointment._id)} type="button">
                      Confirm Cancel
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setCancelId(null); setCancelReason(''); }}
                      type="button"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;

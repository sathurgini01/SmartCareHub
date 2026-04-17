import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiClock, FiCreditCard, FiMapPin, FiSearch, FiStar, FiVideo, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getSpecialtyIcon,
  getStatusBadge
} from '../utils/formatters';
import './MyAppointments.css';

const FILTERS = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

function safeDateParts(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return { day: '--', month: 'N/A' };
  }

  return {
    day: date.getDate(),
    month: date.toLocaleString('default', { month: 'short' })
  };
}

export default function Appointments() {
  const { isAuthenticated, user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const res = await appointmentService.getMyAppointments(params);
      if (res.data.success) {
        setAppointments(res.data.data || []);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      toast.error('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    try {
      const res = await doctorService.getAll({ sortBy: 'rating', limit: 100 });
      if (res.data.success) {
        setDoctors(res.data.data || []);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchDoctors();
    } else {
      setLoading(false);
      setDoctorsLoading(false);
    }
  }, [fetchAppointments, fetchDoctors, isAuthenticated]);

  async function handleCancel(id) {
    if (!cancelReason.trim()) {
      toast.warning('Please provide a cancellation reason');
      return;
    }

    try {
      await appointmentService.cancel(id, cancelReason);
      toast.success('Appointment cancelled');
      setCancelId(null);
      setCancelReason('');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }

  const stats = useMemo(() => ({
    total: appointments.length,
    upcoming: appointments.filter((item) => ['pending', 'confirmed'].includes(item.status)).length,
    completed: appointments.filter((item) => item.status === 'completed').length,
    unpaid: appointments.filter((item) => item.paymentStatus === 'unpaid').length
  }), [appointments]);

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 840, margin: '40px auto' }}>
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <h2>Please log in</h2>
          <p>You need to sign in to manage bookings, payments, and consultations.</p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header animate-slideUp">
          <h1>My Appointments</h1>
          <p>
            Manage bookings, payments, and consultation access for {user?.fullName || user?.name || 'your account'}.
          </p>
        </div>

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card card">
            <div className="stat-title">Total Bookings</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card card">
            <div className="stat-title">Upcoming</div>
            <div className="stat-value">{stats.upcoming}</div>
          </div>
          <div className="stat-card card">
            <div className="stat-title">Completed</div>
            <div className="stat-value">{stats.completed}</div>
          </div>
          <div className="stat-card card">
            <div className="stat-title">Awaiting Payment</div>
            <div className="stat-value">{stats.unpaid}</div>
          </div>
        </div>

        <div className="card animate-fadeIn" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <p className="card-title">Appointment Work Flow</p>
              <p className="card-sub">Find a doctor, book a slot, complete payment, then join telemedicine when it is ready.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/doctors" className="btn btn-primary">
                <FiSearch /> Find Doctors
              </Link>
              <Link to="/payment-history" className="btn btn-secondary">
                <FiCreditCard /> Payment History
              </Link>
            </div>
          </div>
        </div>

        <div className="card animate-fadeIn" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <p className="card-title">Book A New Appointment</p>
              <p className="card-sub">Review doctor details, compare consultation fees, and move straight into the booking page.</p>
            </div>
            <Link to="/doctors" className="btn btn-secondary">
              View All Doctors <FiArrowRight />
            </Link>
          </div>

          <div className="booking-flow-strip">
            <div className="booking-flow-step">
              <span>1</span>
              <strong>Review doctor details</strong>
              <small>Specialty, hospital, fees, and experience</small>
            </div>
            <div className="booking-flow-step">
              <span>2</span>
              <strong>Choose a booking slot</strong>
              <small>Pick date and time inside the booking page</small>
            </div>
            <div className="booking-flow-step">
              <span>3</span>
              <strong>Pay and confirm</strong>
              <small>Complete payment and join consultation later</small>
            </div>
          </div>

          {doctorsLoading ? (
            <div className="spinner-overlay" style={{ minHeight: 120 }}><div className="spinner"></div></div>
          ) : doctors.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <h3>No doctors available</h3>
              <p>Please try again in a moment.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 18
              }}
            >
              {doctors.map((doctor) => (
                <div key={doctor._id} className="card booking-doctor-card">
                  <div className="booking-doctor-card-top">
                    <div className="booking-doctor-avatar">
                      {doctor.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div className="booking-doctor-main">
                      <h3>{doctor.name}</h3>
                      <p className="apt-specialty">
                        {getSpecialtyIcon(doctor.specialty)} {doctor.specialty}
                      </p>
                      <div className="booking-doctor-meta">
                        <span><FiMapPin size={13} /> {doctor.hospital}</span>
                        <span><FiClock size={13} /> {doctor.experience} yrs exp.</span>
                      </div>
                    </div>
                    <div className="doctor-rating booking-doctor-rating">
                      <FiStar className="star-icon" />
                      <span>{doctor.rating?.toFixed?.(1) || '0.0'}</span>
                    </div>
                  </div>

                  <p className="booking-doctor-bio">
                    {doctor.bio || 'Experienced consultant available for patient appointments and follow-up care.'}
                  </p>

                  {Array.isArray(doctor.qualifications) && doctor.qualifications.length ? (
                    <div className="booking-doctor-tags">
                      {doctor.qualifications.slice(0, 3).map((qualification, index) => (
                        <span key={`${doctor._id}-qualification-${index}`} className="qual-tag">
                          {qualification}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {Array.isArray(doctor.availability) && doctor.availability.length ? (
                    <div className="booking-doctor-schedule">
                      <p className="form-label" style={{ marginBottom: 8 }}>Available Days</p>
                      <div className="booking-doctor-schedule-grid">
                        {doctor.availability.slice(0, 3).map((slot, index) => (
                          <div key={`${doctor._id}-availability-${index}`} className="booking-schedule-chip">
                            <strong>{slot.day}</strong>
                            <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="booking-doctor-footer">
                    <div>
                      <span className="fee-label">Consultation Fee</span>
                      <span className="apt-fee">{formatCurrency(doctor.consultationFee || 0)}</span>
                    </div>
                    <div className="booking-doctor-actions">
                      <Link to={`/book/${doctor._id}`} className="btn btn-primary btn-sm">
                        Book Appointment
                      </Link>
                      <Link to={`/doctors?search=${encodeURIComponent(doctor.name)}`} className="btn btn-secondary btn-sm">
                        More Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="appointments-filters animate-fadeIn">
          {FILTERS.map((status) => (
            <button
              key={status || 'all'}
              className={`filter-chip ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-overlay"><div className="spinner"></div></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <h3>No appointments found</h3>
            <p>Book your first appointment to start the patient journey.</p>
            <Link to="/doctors" className="btn btn-primary" style={{ marginTop: 16 }}>
              Browse Doctors
            </Link>
          </div>
        ) : (
          <div className="appointments-list stagger-children">
            {appointments.map((appointment) => {
              const { day, month } = safeDateParts(appointment.appointmentDate);
              const canCancel = !['completed', 'cancelled'].includes(appointment.status);
              const canPay = appointment.paymentStatus === 'unpaid' && appointment.status !== 'cancelled';
              const canJoinConsultation =
                appointment.status === 'confirmed' && appointment.paymentStatus === 'paid';

              return (
                <div key={appointment._id} className="appointment-card card animate-fadeIn">
                  <div className="apt-card-left">
                    <div className="apt-date-block">
                      <span className="apt-date-day">{day}</span>
                      <span className="apt-date-month">{month}</span>
                    </div>
                  </div>

                  <div className="apt-card-content">
                    <div className="apt-card-top">
                      <div>
                        <h3>{appointment.doctorName || 'Doctor appointment'}</h3>
                        <p className="apt-specialty">
                          {getSpecialtyIcon(appointment.specialty)} {appointment.specialty || 'Specialist consultation'}
                        </p>
                      </div>
                      <div className="apt-badges">
                        <span className={`badge ${getStatusBadge(appointment.status)}`}>{appointment.status}</span>
                        <span className={`badge ${getStatusBadge(appointment.paymentStatus || 'unpaid')}`}>
                          {appointment.paymentStatus || 'unpaid'}
                        </span>
                      </div>
                    </div>

                    <div className="apt-card-details">
                      <span><FiCalendar size={13} /> {formatDate(appointment.appointmentDate)}</span>
                      <span>
                        <FiClock size={13} /> {formatTime(appointment.timeSlot?.start || appointment.time)}
                        {appointment.timeSlot?.end ? ` - ${formatTime(appointment.timeSlot.end)}` : ''}
                      </span>
                      <span className="apt-fee">
                        {formatCurrency(appointment.consultationFee || 0, appointment.currency || 'LKR')}
                      </span>
                    </div>

                    {appointment.reason ? <p className="apt-reason">Reason: {appointment.reason}</p> : null}
                    {appointment.notes ? <p className="apt-reason">Notes: {appointment.notes}</p> : null}
                    {appointment.appointmentNumber ? <p className="apt-ref">Ref: {appointment.appointmentNumber}</p> : null}

                    <div className="apt-card-actions">
                      {canPay ? (
                        <Link to={`/payment/${appointment._id}`} className="btn btn-primary btn-sm">
                          <FiCreditCard /> Pay Now
                        </Link>
                      ) : null}

                      {canJoinConsultation ? (
                        <Link to={`/patient/consultation/${appointment._id}`} className="btn btn-success btn-sm">
                          <FiVideo /> Join Consultation
                        </Link>
                      ) : null}

                      {canCancel ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setCancelId(cancelId === appointment._id ? null : appointment._id)}
                        >
                          <FiX /> Cancel
                        </button>
                      ) : null}
                    </div>

                    {cancelId === appointment._id ? (
                      <div className="cancel-form animate-slideDown">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Reason for cancellation..."
                          value={cancelReason}
                          onChange={(event) => setCancelReason(event.target.value)}
                        />
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appointment._id)}>
                          Confirm Cancel
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setCancelId(null);
                            setCancelReason('');
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

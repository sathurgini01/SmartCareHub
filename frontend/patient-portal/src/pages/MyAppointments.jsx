import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import { formatDate, formatTime, formatCurrency, getStatusBadge, getSpecialtyIcon } from '../utils/formatters';
import { FiCalendar, FiClock, FiX, FiCreditCard, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './MyAppointments.css';

const MyAppointments = () => {
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (isAuthenticated) fetchAppointments();
  }, [isAuthenticated, filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const res = await appointmentService.getMyAppointments(params);
      if (res.data.success) setAppointments(res.data.data);
    } catch (err) {
      toast.error('Failed to load appointments');
    }
    setLoading(false);
  };

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
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <h3>Please log in</h3>
            <p>You need to be logged in to view your appointments</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-appointments page-wrapper">
      <div className="container">
        <div className="page-header animate-slideUp">
          <h1>My Appointments</h1>
          <p>View and manage your booked appointments</p>
        </div>

        <div className="appointments-filters animate-fadeIn">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              className={`filter-chip ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s || 'All'}{s && <span className="chip-dot"></span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-overlay"><div className="spinner"></div></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <h3>No appointments found</h3>
            <p>Book your first appointment with a doctor</p>
            <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '16px' }}>Find Doctors</Link>
          </div>
        ) : (
          <div className="appointments-list stagger-children">
            {appointments.map((apt) => (
              <div key={apt._id} className="appointment-card card animate-fadeIn">
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
                      <span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span>
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
                      <Link to={`/payment/${apt._id}`} className="btn btn-primary btn-sm">
                        <FiCreditCard /> Pay Now
                      </Link>
                    )}
                    {!['completed', 'cancelled'].includes(apt.status) && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setCancelId(cancelId === apt._id ? null : apt._id)}
                      >
                        <FiX /> Cancel
                      </button>
                    )}
                  </div>

                  {cancelId === apt._id && (
                    <div className="cancel-form animate-slideDown">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Reason for cancellation..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      />
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(apt._id)}>Confirm Cancel</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setCancelId(null); setCancelReason(''); }}>Dismiss</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import doctorService from '../services/doctorService';
import appointmentService from '../services/appointmentService';
import { formatCurrency, formatTime, getSpecialtyIcon, formatDateLong } from '../utils/formatters';
import { FiCalendar, FiClock, FiStar, FiMapPin, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './BookAppointment.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    reason: '',
    notes: '',
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: ''
  });

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        patientName: prev.patientName || user.name || '',
        patientEmail: prev.patientEmail || user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (selectedDate && doctor) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchDoctor = async () => {
    try {
      const res = await doctorService.getById(doctorId);
      if (res.data.success) setDoctor(res.data.data);
    } catch (err) {
      toast.error('Failed to load doctor details');
      navigate('/doctors');
    }
    setLoading(false);
  };

  const fetchSlots = async (date) => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await doctorService.getAvailability(doctorId, date);
      if (res.data.success) setSlots(res.data.data.slots);
    } catch (err) {
      toast.error('Failed to load availability');
      setSlots([]);
    }
    setSlotsLoading(false);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.warning('Please login to book an appointment');
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      toast.warning('Please select a date and time slot');
      return;
    }

    if (form.reason.trim().length < 5) {
      toast.warning('Please provide a reason for your visit');
      return;
    }

    setSubmitting(true);
    try {
      const res = await appointmentService.create({
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: { start: selectedSlot.start, end: selectedSlot.end },
        reason: form.reason,
        notes: form.notes,
        patientName: form.patientName,
        patientEmail: form.patientEmail,
        patientPhone: form.patientPhone
      });

      if (res.data.success) {
        toast.success('Appointment booked successfully!');
        // Navigate to payment
        navigate(`/payment/${res.data.data._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to book appointment';
      toast.error(msg);
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="page-wrapper"><div className="spinner-overlay"><div className="spinner"></div></div></div>;
  }

  if (!doctor) return null;

  const availableSlots = slots.filter(s => s.available);
  const bookedSlots = slots.filter(s => !s.available);

  return (
    <div className="book-appointment page-wrapper">
      <div className="container">
        <div className="booking-layout">
          {/* Doctor Info Sidebar */}
          <div className="booking-sidebar animate-slideUp">
            <div className="card doctor-info-card">
              <div className="doctor-avatar-xl">
                {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <h2>{doctor.name}</h2>
              <p className="doc-specialty">{getSpecialtyIcon(doctor.specialty)} {doctor.specialty}</p>
              
              <div className="doc-meta">
                <div><FiStar className="star-filled" /> <strong>{doctor.rating.toFixed(1)}</strong> ({doctor.totalReviews} reviews)</div>
                <div><FiMapPin /> {doctor.hospital}</div>
                <div><FiClock /> {doctor.experience} years exp.</div>
              </div>

              <div className="doc-fee-display">
                <span>Consultation Fee</span>
                <strong>{formatCurrency(doctor.consultationFee)}</strong>
              </div>

              <div className="doc-schedule">
                <h4>Available Days</h4>
                {doctor.availability.map((a, i) => (
                  <div key={i} className="schedule-row">
                    <span className="schedule-day">{a.day}</span>
                    <span className="schedule-time">{formatTime(a.startTime)} - {formatTime(a.endTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-main animate-slideUp" style={{ animationDelay: '100ms' }}>
            <div className="page-header">
              <h1>Book Appointment</h1>
              <p>Select a date and time slot to book your appointment</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Date */}
              <div className="booking-step">
                <div className="step-label">
                  <span className="step-num">1</span>
                  <span>Select Date</span>
                </div>
                <div className="card">
                  <input
                    type="date"
                    className="form-input date-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                  />
                  {selectedDate && (
                    <p className="date-display">
                      <FiCalendar /> {formatDateLong(selectedDate)}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Time Slot */}
              <div className="booking-step">
                <div className="step-label">
                  <span className="step-num">2</span>
                  <span>Select Time Slot</span>
                </div>
                <div className="card">
                  {!selectedDate ? (
                    <p className="slot-hint">Please select a date first</p>
                  ) : slotsLoading ? (
                    <div className="spinner-overlay" style={{ minHeight: '100px' }}><div className="spinner"></div></div>
                  ) : slots.length === 0 ? (
                    <div className="slot-hint">
                      <FiAlertCircle /> No available slots on this day. The doctor may not work on this day.
                    </div>
                  ) : (
                    <>
                      <div className="slots-legend">
                        <span className="legend-item"><span className="legend-dot available"></span> Available ({availableSlots.length})</span>
                        <span className="legend-item"><span className="legend-dot booked"></span> Booked ({bookedSlots.length})</span>
                      </div>
                      <div className="slots-grid">
                        {slots.map((slot, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`slot-btn ${!slot.available ? 'booked' : ''} ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {selectedSlot?.start === slot.start && <FiCheck size={14} />}
                            {formatTime(slot.start)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Step 3: Patient Info */}
              <div className="booking-step">
                <div className="step-label">
                  <span className="step-num">3</span>
                  <span>Patient Details</span>
                </div>
                <div className="card">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={form.patientName}
                        onChange={(e) => setForm({...form, patientName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        value={form.patientEmail}
                        onChange={(e) => setForm({...form, patientEmail: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+94 7X XXX XXXX"
                      value={form.patientPhone}
                      onChange={(e) => setForm({...form, patientPhone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason for Visit *</label>
                    <textarea
                      className="form-input"
                      placeholder="Briefly describe your symptoms or reason for the visit..."
                      value={form.reason}
                      onChange={(e) => setForm({...form, reason: e.target.value})}
                      required
                      minLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      className="form-input"
                      placeholder="Any allergies, medications, or special requirements..."
                      value={form.notes}
                      onChange={(e) => setForm({...form, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Summary & Submit */}
              {selectedDate && selectedSlot && (
                <div className="booking-summary card animate-scaleIn">
                  <h3>Booking Summary</h3>
                  <div className="summary-grid">
                    <div><span>Doctor</span><strong>{doctor.name}</strong></div>
                    <div><span>Specialty</span><strong>{doctor.specialty}</strong></div>
                    <div><span>Date</span><strong>{formatDateLong(selectedDate)}</strong></div>
                    <div><span>Time</span><strong>{formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}</strong></div>
                    <div><span>Fee</span><strong className="summary-fee">{formatCurrency(doctor.consultationFee)}</strong></div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg btn-block"
                    disabled={submitting}
                  >
                    {submitting ? 'Booking...' : 'Confirm & Proceed to Payment'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;

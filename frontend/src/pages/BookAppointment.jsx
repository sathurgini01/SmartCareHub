import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import doctorService from '../services/doctorService';
import appointmentService from '../services/appointmentService';
import { formatCurrency, formatTime, getSpecialtyIcon, formatDateLong } from '../utils/formatters';
import { FiCalendar, FiClock, FiStar, FiMapPin, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import BookingForm from '../components/appointments/BookingForm';
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
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot({ start: '09:00', end: '09:30' });
                    }}
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

              {/* Booking Form Integration */}
              <BookingForm 
                form={form} 
                setForm={setForm} 
                submitting={submitting} 
                selectedDate={selectedDate ? formatDateLong(selectedDate) : null}
                doctorName={doctor.name}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;

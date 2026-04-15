import React from 'react';
import { formatTime } from '../../utils/formatters';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';

const TimeSlotPicker = ({ slots, loading, selectedDate, selectedSlot, onSelectSlot }) => {
  if (!selectedDate) return <p className="slot-hint">Please select a date first</p>;
  if (loading) return <LoadingSpinner />;
  if (slots.length === 0) return <div className="slot-hint"><FiAlertCircle /> No available slots on this day.</div>;
  
  const availableSlots = slots.filter(s => s.available);
  const bookedSlots = slots.filter(s => !s.available);
  
  return (
    <>
      <div className="slots-legend">
        <span className="legend-item"><span className="legend-dot available"></span> Available ({availableSlots.length})</span>
        <span className="legend-item"><span className="legend-dot booked"></span> Booked ({bookedSlots.length})</span>
      </div>
      <div className="slots-grid">
        {slots.map((slot, i) => (
          <button key={i} type="button" className={`slot-btn ${!slot.available ? 'booked' : ''} ${selectedSlot?.start === slot.start ? 'selected' : ''}`} disabled={!slot.available} onClick={() => onSelectSlot(slot)}>
            {selectedSlot?.start === slot.start && <FiCheck size={14} />}
            {formatTime(slot.start)}
          </button>
        ))}
      </div>
    </>
  );
};
export default TimeSlotPicker;

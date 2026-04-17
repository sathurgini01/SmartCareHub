import React from 'react';
import { FiUser, FiMail, FiPhone, FiMessageSquare, FiFileText, FiCheckCircle } from 'react-icons/fi';

const BookingForm = ({ form, setForm, submitting, selectedDate, doctorName }) => {
  return (
    <div className="booking-form-container">
      <div className="section-heading">
        <h2><FiUser style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Patient Information</h2>
        <p>Please provide details for the patient visiting the doctor.</p>
      </div>

      <div className="card compact-card shadow-lg animate-fadeIn">
        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label"><FiUser size={14} /> Full Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. John Doe"
              value={form.patientName} 
              onChange={e => setForm({...form, patientName: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group flex-1">
            <label className="form-label"><FiMail size={14} /> Email Address *</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="patient@example.com"
              value={form.patientEmail} 
              onChange={e => setForm({...form, patientEmail: e.target.value})} 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label"><FiPhone size={14} /> Contact Number</label>
          <input 
            type="tel" 
            className="form-input" 
            placeholder="+94 7X XXX XXXX" 
            value={form.patientPhone} 
            onChange={e => setForm({...form, patientPhone: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label className="form-label"><FiMessageSquare size={14} /> Reason for Visit *</label>
          <textarea 
            className="form-input" 
            rows="3"
            placeholder="Please describe symptoms (e.g. Fever, Headache, Routine Checkup)" 
            value={form.reason} 
            onChange={e => setForm({...form, reason: e.target.value})} 
            required 
            minLength={5} 
          />
        </div>

        <div className="form-group">
          <label className="form-label"><FiFileText size={14} /> Additional Notes (Optional)</label>
          <textarea 
            className="form-input" 
            rows="2"
            placeholder="Allergies, previous history, etc."
            value={form.notes} 
            onChange={e => setForm({...form, notes: e.target.value})} 
          />
        </div>
      </div>

      {selectedDate && (
        <div className="submit-section card animate-slideUp" style={{ marginTop: '24px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, color: '#22c55e' }}>Ready to Book?</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>
                You are booking for <strong>{selectedDate}</strong> with <strong>{doctorName}</strong>.
              </p>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              disabled={submitting}
              style={{ padding: '12px 32px' }}
            >
              {submitting ? 'Processing...' : (
                <>
                  <FiCheckCircle style={{ marginRight: '8px' }} /> Confirm & Proceed
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;

import React from 'react';

const BookingForm = ({ form, setForm }) => (
  <div className="card">
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input type="text" className="form-input" value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} required />
      </div>
      <div className="form-group">
        <label className="form-label">Email *</label>
        <input type="email" className="form-input" value={form.patientEmail} onChange={e => setForm({...form, patientEmail: e.target.value})} required />
      </div>
    </div>
    <div className="form-group">
      <label className="form-label">Phone Number</label>
      <input type="tel" className="form-input" placeholder="+94 7X XXX XXXX" value={form.patientPhone} onChange={e => setForm({...form, patientPhone: e.target.value})} />
    </div>
    <div className="form-group">
      <label className="form-label">Reason for Visit *</label>
      <textarea className="form-input" placeholder="Briefly describe symptoms..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required minLength={5} />
    </div>
    <div className="form-group">
      <label className="form-label">Additional Notes</label>
      <textarea className="form-input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
    </div>
  </div>
);
export default BookingForm;

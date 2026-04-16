import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PaymentReceipt = ({ payment }) => (
  <div className="receipt-card">
    <div className="receipt-header"><span>Transaction Receipt</span><span className="receipt-ref">{payment.transactionRef}</span></div>
    <div className="receipt-body">
      <div className="receipt-row"><span>Doctor</span><strong>{payment.doctorName}</strong></div>
      <div className="receipt-row"><span>Patient</span><strong>{payment.patientName}</strong></div>
      <div className="receipt-row"><span>Email</span><strong>{payment.patientEmail}</strong></div>
      <div className="receipt-row"><span>Payment Method</span><strong style={{textTransform: 'capitalize'}}>{payment.method}</strong></div>
      <div className="receipt-row"><span>Status</span><strong className={`status-${payment.status}`}>{payment.status}</strong></div>
      {payment.paidAt && <div className="receipt-row"><span>Paid At</span><strong>{formatDate(payment.paidAt)}</strong></div>}
    </div>
    <div className="receipt-total">
      <span>Total Paid</span><strong>{formatCurrency(payment.amount, payment.currency)}</strong>
    </div>
  </div>
);
export default PaymentReceipt;

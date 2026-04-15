import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiArrowRight } from 'react-icons/fi';
import './PaymentConfirmation.css';

const PaymentConfirmation = () => {
  const { paymentId } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const res = await paymentService.getById(paymentId);
      if (res.data.success) setPayment(res.data.data);
    } catch (err) {
      console.error('Failed to fetch payment:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="page-wrapper"><div className="spinner-overlay"><div className="spinner"></div></div></div>;
  }

  if (!payment) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <h3>Payment not found</h3>
            <Link to="/appointments" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Appointments</Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = payment.status === 'completed';
  const isPending = payment.status === 'pending' || payment.status === 'processing';

  return (
    <div className="confirmation-page page-wrapper">
      <div className="container">
        <div className="confirmation-card card animate-scaleIn">
          <div className={`confirm-icon ${isSuccess ? 'success' : isPending ? 'pending' : 'failed'}`}>
            {isSuccess ? <FiCheckCircle size={56} /> : isPending ? <FiClock size={56} /> : <FiXCircle size={56} />}
          </div>

          <h1>
            {isSuccess ? 'Payment Successful!' : isPending ? 'Payment Pending' : 'Payment Failed'}
          </h1>
          <p className="confirm-sub">
            {isSuccess
              ? 'Your appointment has been confirmed and payment received.'
              : isPending
              ? 'Your payment is being processed. Please wait.'
              : 'Something went wrong. Please try again.'}
          </p>

          <div className="receipt-card">
            <div className="receipt-header">
              <span>Transaction Receipt</span>
              <span className="receipt-ref">{payment.transactionRef}</span>
            </div>

            <div className="receipt-body">
              <div className="receipt-row">
                <span>Doctor</span>
                <strong>{payment.doctorName}</strong>
              </div>
              <div className="receipt-row">
                <span>Patient</span>
                <strong>{payment.patientName}</strong>
              </div>
              <div className="receipt-row">
                <span>Email</span>
                <strong>{payment.patientEmail}</strong>
              </div>
              <div className="receipt-row">
                <span>Payment Method</span>
                <strong style={{ textTransform: 'capitalize' }}>{payment.method}</strong>
              </div>
              <div className="receipt-row">
                <span>Status</span>
                <strong className={`status-${payment.status}`}>{payment.status}</strong>
              </div>
              {payment.paidAt && (
                <div className="receipt-row">
                  <span>Paid At</span>
                  <strong>{formatDate(payment.paidAt)}</strong>
                </div>
              )}
            </div>

            <div className="receipt-total">
              <span>Total Paid</span>
              <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
            </div>
          </div>

          <div className="confirm-actions">
            <Link to="/appointments" className="btn btn-primary">
              View My Appointments <FiArrowRight />
            </Link>
            <Link to="/doctors" className="btn btn-secondary">
              Book Another
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;

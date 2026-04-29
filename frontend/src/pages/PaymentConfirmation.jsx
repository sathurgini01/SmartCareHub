import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FiCheckCircle, FiXCircle, FiClock, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import './PaymentConfirmation.css';

const PaymentConfirmation = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
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
  const isFailed  = payment.status === 'failed' || payment.status === 'cancelled';

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
              ? 'Your payment is being processed. Please wait a moment.'
              : 'Your payment was declined or cancelled. Please try again with a different card.'}
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
              <span>Total {isSuccess ? 'Paid' : 'Amount'}</span>
              <strong>{formatCurrency(payment.amount, payment.currency)}</strong>
            </div>
          </div>

          <div className="confirm-actions">
            {isSuccess && (
              <Link to="/appointments" className="btn btn-primary">
                View My Appointments <FiArrowRight />
              </Link>
            )}
            {isFailed && (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/payment/${payment.appointmentId}`)}
              >
                <FiRefreshCw /> Try Again
              </button>
            )}
            {(isSuccess || isFailed) && (
              <Link to="/appointments" className="btn btn-secondary">
                {isFailed ? 'Back to Appointments' : 'Book Another'}
              </Link>
            )}
            {isPending && (
              <>
                <button className="btn btn-secondary" onClick={fetchPayment}>
                  <FiRefreshCw /> Check Status
                </button>
                <Link to="/appointments" className="btn btn-ghost">
                  Back to Appointments
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;



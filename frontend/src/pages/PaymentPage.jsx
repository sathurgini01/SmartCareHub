import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import appointmentService from '../services/appointmentService';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate, formatTime, getSpecialtyIcon } from '../utils/formatters';
import { FiShield, FiCheck, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './PaymentPage.css';

const PaymentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('payhere');

  // Load appointment details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const aptRes = await appointmentService.getById(appointmentId);
        if (aptRes.data.success) {
          setAppointment(aptRes.data.data);
          
          // Check if already paid
          try {
            const payRes = await paymentService.getByAppointment(appointmentId);
            if (payRes.data.success && payRes.data.data.status === 'completed') {
              navigate(`/payment/confirm/${payRes.data.data._id}`);
              return;
            }
          } catch (e) {
            // No payment found or error, continue to checkout
          }
        }
      } catch (err) {
        toast.error('Failed to load appointment details');
        navigate('/appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appointmentId, navigate]);

  const handlePayment = async () => {
    if (!appointment) return;
    
    setProcessing(true);
    try {
      if (paymentMethod === 'cash') {
        toast.success('Appointment confirmed! Please pay at the clinic.');
        navigate('/appointments');
        return;
      }

      if (paymentMethod === 'payhere') {
        if (!window.payhere) {
          toast.error('PayHere service not available');
          setProcessing(false);
          return;
        }

        let payhereData = null;
        let paymentId = null;

        try {
          const res = await paymentService.create({
            appointmentId,
            amount: appointment.consultationFee,
            currency: appointment.currency || 'LKR',
            method: 'payhere',
            patientName: appointment.patientName,
            patientEmail: appointment.patientEmail,
            patientPhone: '0770000000', // Mock phone
            doctorName: appointment.doctorName,
            specialty: appointment.specialty,
          });

          if (res.data.success && res.data.payhereData) {
            payhereData = res.data.payhereData;
            paymentId = res.data.data._id;
          }
        } catch (err) {
          if (err.response && err.response.status === 409) {
            const payRes = await paymentService.getByAppointment(appointmentId);
            if (payRes.data.success && payRes.data.payhereData) {
              payhereData = payRes.data.payhereData;
              paymentId = payRes.data.data._id;
            } else {
              throw new Error('Failed to retrieve existing payment intent');
            }
          } else {
            throw err;
          }
        }

        if (payhereData) {
          window.payhere.onCompleted = async function onCompleted(orderId) {
            try {
              // In dev environment, PayHere webhook cannot reach localhost.
              // So we manually tell the backend to complete the payment.
              await paymentService.simulate(paymentId);
            } catch(e) {}
            toast.success("Payment completed successfully!");
            navigate(`/payment/confirm/${paymentId}`);
          };

          window.payhere.onDismissed = function onDismissed() {
            toast.info("Payment dismissed");
            setProcessing(false);
          };

          window.payhere.onError = function onError(error) {
            toast.error("Payment Error: " + error);
            setProcessing(false);
          };

          window.payhere.startPayment(payhereData);
        } else {
          toast.error('Failed to initialize payment');
          setProcessing(false);
        }
      }
    } catch (err) {
      toast.error('Payment processing failed.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="spinner-overlay">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!appointment) return null;

  return (
    <div className="payment-page page-wrapper">
      <div className="container">
        <div className="payment-layout">
          <div className="payment-main animate-slideUp">
            <div className="page-header">
              <h1>Secure Checkout</h1>
              <p>Complete your payment to confirm the booking</p>
            </div>

            <div className="payment-methods card">
              <h3>Select Payment Method</h3>
              
              {/* PayHere Option */}
              <label className={`method-option ${paymentMethod === 'payhere' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="method"
                  value="payhere"
                  checked={paymentMethod === 'payhere'}
                  onChange={() => setPaymentMethod('payhere')}
                />
                <div className="method-content">
                  <div className="method-icon">🛡️</div>
                  <div>
                    <strong>PayHere Secure</strong>
                    <span>Online Payment Gateway (Sandbox)</span>
                  </div>
                </div>
                <FiCheck className="method-check" />
              </label>

              {/* Cash at Clinic Option - Always available */}
              <label className={`method-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="method"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <div className="method-content">
                  <div className="method-icon">💵</div>
                  <div>
                    <strong>Cash at Clinic</strong>
                    <span>Pay when you visit</span>
                  </div>
                </div>
                <FiCheck className="method-check" />
              </label>
            </div>

            <div className="payment-info-box">
              <FiInfo />
              <span>
                {paymentMethod === 'payhere'
                  ? 'You will be redirected to PayHere secure checkout. Use Sandbox credentials for testing.'
                  : 'Your appointment will be confirmed after payment at the clinic.'}
              </span>
            </div>

            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? 'Processing...' : (
                paymentMethod === 'cash'
                  ? 'Confirm Appointment'
                  : `Pay ${formatCurrency(appointment.consultationFee)} via PayHere`
              )}
            </button>

            <div className="security-notice">
              <FiShield /> Your information is encrypted and secure
            </div>
          </div>

          <div className="payment-sidebar animate-slideUp">
            <div className="card order-summary">
              <h3>Order Summary</h3>
              <div className="summary-doctor">
                <div className="summary-avatar">
                  {appointment.doctorName ? appointment.doctorName.split(' ').map(n => n[0]).join('').substring(0, 2) : 'DR'}
                </div>
                <div>
                  <strong>{appointment.doctorName}</strong>
                  <p>{getSpecialtyIcon(appointment.specialty)} {appointment.specialty}</p>
                </div>
              </div>

              <div className="summary-details">
                <div className="summary-row">
                  <span>Date</span>
                  <strong>{formatDate(appointment.appointmentDate)}</strong>
                </div>
                <div className="summary-row">
                  <span>Time</span>
                  <strong>{formatTime(appointment.timeSlot.start)} - {formatTime(appointment.timeSlot.end)}</strong>
                </div>
                <div className="summary-row">
                  <span>Ref</span>
                  <strong className="ref-code">{appointment.appointmentNumber}</strong>
                </div>
              </div>

              <div className="summary-total">
                <span>Total Amount</span>
                <strong>{formatCurrency(appointment.consultationFee)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

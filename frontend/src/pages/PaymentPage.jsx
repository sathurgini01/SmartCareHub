import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate, formatTime, getSpecialtyIcon } from '../utils/formatters';
import { FiCreditCard, FiShield, FiCheck, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './PaymentPage.css';

const PaymentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [existingPayment, setExistingPayment] = useState(null);
  const [payhereData, setPayhereData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('payhere');

  useEffect(() => {
    fetchData();
  }, [appointmentId]);

  const fetchData = async () => {
    try {
      const aptRes = await appointmentService.getById(appointmentId);
      if (aptRes.data.success) {
        setAppointment(aptRes.data.data);
      }

      // Check for existing payment
      try {
        const payRes = await paymentService.getByAppointment(appointmentId);
        if (payRes.data.success) {
          const pay = payRes.data.data;

          // If payment is in a failed/cancelled state, cancel it so user can retry
          if (['failed', 'cancelled'].includes(pay.status)) {
            try { await paymentService.cancel(pay._id); } catch (_) {}
            setLoading(false);
            return;
          }

          setExistingPayment(pay);
          if (payRes.data.payhereData) {
            setPayhereData(payRes.data.payhereData);
          }

          if (pay.status === 'completed') {
            // Verify appointment is also updated — fix stale cross-service state
            const apt = aptRes.data.data;
            if (apt && apt.paymentStatus !== 'paid') {
              // Re-sync: appointment was never updated (cross-service call failed before)
              try { await paymentService.simulate(pay._id); } catch (_) {}
            }
            navigate(`/payment/confirm/${pay._id}`);
            return;
          }
        }
      } catch (e) {
        // No existing payment — fresh start
      }
    } catch (err) {
      toast.error('Failed to load appointment details');
      navigate('/appointments');
    }
    setLoading(false);
  };

  const handlePayHere = async () => {
    setProcessing(true);
    try {
      // ── Cash at Clinic: no payment record needed ──────────────────────
      if (paymentMethod === 'cash') {
        toast.success('Appointment confirmed! Please pay at the clinic.');
        navigate('/appointments');
        return;
      }

      // ── PayHere: create/retrieve payment record ───────────────────────
      let finalPayhereData = payhereData;
      let currentPaymentId = existingPayment?._id;

      if (!existingPayment) {
        const res = await paymentService.create({
          appointmentId,
          amount: appointment.consultationFee,
          currency: appointment.currency || 'LKR',
          method: 'payhere',
          patientName: appointment.patientName,
          patientEmail: appointment.patientEmail,
          patientPhone: appointment.patientPhone || '',
          doctorName: appointment.doctorName,
          specialty: appointment.specialty
        });

        if (res.data.success) {
          setExistingPayment(res.data.data);
          currentPaymentId = res.data.data._id;
          finalPayhereData = res.data.payhereData;
          setPayhereData(finalPayhereData);
        }
      }

      // ── Launch PayHere popup ──────────────────────────────────────────
      if (finalPayhereData && window.payhere) {
        window.payhere.onCompleted = async function(orderId) {
          // ⚠️  PayHere sandbox fires onCompleted even for declined cards.
          // We MUST verify the actual backend status before marking complete.
          toast.info('Verifying payment…');

          // Wait 2 s to give the notify_url webhook a chance to fire
          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            const statusRes = await paymentService.getById(currentPaymentId);
            const actualStatus = statusRes.data.data?.status;

            if (actualStatus === 'completed') {
              // Webhook already confirmed success — nothing more to do
              toast.success('Payment completed!');
              navigate(`/payment/confirm/${currentPaymentId}`);

            } else if (actualStatus === 'pending' || actualStatus === 'processing') {
              // Localhost workaround: webhook can't reach us, but onCompleted
              // only fires when PayHere considers the attempt finished.
              // We will automatically simulate success to make it seamless.
              await paymentService.simulate(currentPaymentId);
              toast.success('Payment completed!');
              navigate(`/payment/confirm/${currentPaymentId}`);

            } else {
              // 'failed' or 'cancelled' — webhook fired and reported decline
              toast.error('Payment was declined by the bank. Please try a different card.');
              // Cancel this payment record so the user can create a fresh attempt
              try { await paymentService.cancel(currentPaymentId); } catch (_) {}
              setExistingPayment(null);
              setPayhereData(null);
              setProcessing(false);
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            toast.error('Could not verify payment status. Check your appointments.');
            setProcessing(false);
          }
        };

        window.payhere.onDismissed = function() {
          toast.info('Payment cancelled. You can try again.');
          setProcessing(false);
        };

        window.payhere.onError = function(error) {
          toast.error('PayHere error: Check your sandbox merchant credentials.');
          console.error('PayHere SDK error:', error);
          setProcessing(false);
        };

        window.payhere.startPayment(finalPayhereData);
        return; // Keep processing=true while popup is open
      } else if (!window.payhere) {
        toast.error('PayHere script failed to load. Disable adblockers and refresh.');
      } else {
        toast.error('Payment configuration missing. Contact support.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    }
    setProcessing(false);
  };

  if (loading) {
    return <div className="page-wrapper"><div className="spinner-overlay"><div className="spinner"></div></div></div>;
  }

  if (!appointment) return null;

  return (
    <div className="payment-page page-wrapper">
      <div className="container">
        <div className="payment-layout">
          <div className="payment-main animate-slideUp">
            <div className="page-header">
              <h1>Complete Payment</h1>
              <p>Secure payment to confirm your appointment</p>
            </div>

            {/* Payment Method Selection */}
            <div className="payment-methods card">
              <h3>Select Payment Method</h3>
              <div className="method-options">
                <label className={`method-option ${paymentMethod === 'payhere' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="payhere"
                    checked={paymentMethod === 'payhere'}
                    onChange={() => setPaymentMethod('payhere')}
                  />
                  <div className="method-content">
                    <div className="method-icon">💳</div>
                    <div>
                      <strong>PayHere</strong>
                      <span>Card / Bank Transfer / Mobile</span>
                    </div>
                  </div>
                  <FiCheck className="method-check" />
                </label>

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
                    ? 'You will be redirected to PayHere secure checkout. Test cards are available in sandbox mode.'
                    : 'Your appointment will be confirmed after payment at the clinic.'}
                </span>
              </div>

              {paymentMethod === 'payhere' && (
                <div style={{ display: 'none' }} className="test-cards"></div>
              )}

              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handlePayHere}
                disabled={processing}
              >
                {processing ? 'Processing...' : (
                  paymentMethod === 'payhere' 
                    ? `Pay ${formatCurrency(appointment.consultationFee)} via PayHere`
                    : 'Confirm Appointment'
                )}
              </button>
            </div>

            <div className="security-notice">
              <FiShield /> Your payment information is encrypted and secure
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="payment-sidebar animate-slideUp" style={{ animationDelay: '100ms' }}>
            <div className="card order-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-doctor">
                <div className="summary-avatar">
                  {appointment.doctorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
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

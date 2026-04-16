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
          setExistingPayment(payRes.data.data);
          if (payRes.data.payhereData) {
            setPayhereData(payRes.data.payhereData);
          }
          if (payRes.data.data.status === 'completed') {
            navigate(`/payment/confirm/${payRes.data.data._id}`);
            return;
          }
        }
      } catch (e) {
        // No existing payment, that's fine
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
      let finalPayhereData = payhereData;
      let currentPaymentId = existingPayment?._id;
      
      if (!existingPayment) {
        // Create payment record
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

      // Launch PayHere popup if data is available
      if (paymentMethod === 'payhere') {
        if (finalPayhereData && window.payhere) {
          window.payhere.onCompleted = async function(orderId) {
            try {
              // Localhost workaround: PayHere servers cannot reach localhost for the notify_url webhook.
              // So we manually mark it as complete from the frontend upon SDK success.
              await paymentService.simulate(currentPaymentId);
            } catch (err) {
              console.error('Localhost completion sync failed', err);
            }
            toast.success('Payment completed!');
            navigate(`/payment/confirm/${currentPaymentId}`);
          };
          window.payhere.onDismissed = function() {
            toast.info('Payment dismissed. You can try again.');
            setProcessing(false);
          };
          window.payhere.onError = function(error) {
            toast.error('Payment error: Payhere Sandbox Initialization Failed. Are your Merchant credentials correct?');
            setProcessing(false);
          };
          window.payhere.startPayment(finalPayhereData);
          return;
        } else if (!window.payhere) {
            toast.error('Payment blocked: PayHere script failed to load. Please disable adblockers or Brave Shields.');
        } else {
            toast.error('Payment config invalid: Sandbox credentials missing.');
        }
      }

      if (paymentMethod === 'cash') {
         toast.success('Cash payment reserved.');
         navigate(`/appointments`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
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

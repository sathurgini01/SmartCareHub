import React from 'react';
import { FiCheck, FiInfo } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';

const PaymentForm = ({ paymentMethod, setPaymentMethod, processing, amount, onPay }) => (
  <div className="payment-methods card">
    <h3>Select Payment Method</h3>
    <div className="method-options">
      <label className={`method-option ${paymentMethod === 'payhere' ? 'selected' : ''}`}>
        <input type="radio" name="method" value="payhere" checked={paymentMethod === 'payhere'} onChange={() => setPaymentMethod('payhere')} />
        <div className="method-content"><div className="method-icon">💳</div><div><strong>PayHere</strong><span>Card / Bank Transfer / Mobile</span></div></div>
        <FiCheck className="method-check" />
      </label>
      <label className={`method-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
        <input type="radio" name="method" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
        <div className="method-content"><div className="method-icon">💵</div><div><strong>Cash at Clinic</strong><span>Pay when you visit</span></div></div>
        <FiCheck className="method-check" />
      </label>
    </div>
    <div className="payment-info-box">
      <FiInfo />
      <span>{paymentMethod === 'payhere' ? 'You will be redirected to PayHere. Sandbox mode active.' : 'Appointment confirmed after payment.'}</span>
    </div>
    {paymentMethod === 'payhere' && (
      <div style={{ display: 'none' }} className="test-cards"></div>
    )}
    <button className="btn btn-primary btn-lg btn-block" onClick={onPay} disabled={processing}>
      {processing ? 'Processing...' : (paymentMethod === 'payhere' ? `Pay ${formatCurrency(amount)} via PayHere` : 'Confirm Appointment')}
    </button>
  </div>
);
export default PaymentForm;

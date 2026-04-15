import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate, getStatusBadge, getRelativeTime } from '../utils/formatters';
import { FiCreditCard } from 'react-icons/fi';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const { isAuthenticated } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated) fetchPayments();
  }, [isAuthenticated, filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const res = await paymentService.getMyPayments(params);
      if (res.data.success) setPayments(res.data.data);
    } catch (err) {
      console.error('Failed to load payments:', err);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <h3>Please log in</h3>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history page-wrapper">
      <div className="container">
        <div className="page-header animate-slideUp">
          <h1>Payment History</h1>
          <p>Track all your payments and transactions</p>
        </div>

        <div className="appointments-filters animate-fadeIn">
          {['', 'completed', 'pending', 'refunded', 'cancelled'].map(s => (
            <button
              key={s}
              className={`filter-chip ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-overlay"><div className="spinner"></div></div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <FiCreditCard size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3>No payments found</h3>
            <p>Your payment history will appear here after your first booking</p>
          </div>
        ) : (
          <div className="payments-table-wrap card">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id} className="animate-fadeIn">
                    <td>
                      <Link to={`/payment/confirm/${p._id}`} className="txn-link">{p.transactionRef}</Link>
                    </td>
                    <td>{p.doctorName}</td>
                    <td className="amount-cell">{formatCurrency(p.amount, p.currency)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.method}</td>
                    <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                    <td className="date-cell">{getRelativeTime(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;

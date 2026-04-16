import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import appointmentService from '../services/appointmentService';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate, formatTime, getStatusBadge, getRelativeTime } from '../utils/formatters';
import { FiCalendar, FiCreditCard, FiList, FiX, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [aptStats, setAptStats] = useState({});
  const [payments, setPayments] = useState([]);
  const [payStats, setPayStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'appointments') {
        const res = await appointmentService.adminGetAll({ limit: 50 });
        if (res.data.success) {
          setAppointments(res.data.data);
          setAptStats(res.data.stats || {});
        }
      } else if (activeTab === 'payments') {
        const res = await paymentService.adminGetAll({ limit: 50 });
        if (res.data.success) {
          setPayments(res.data.data);
          setPayStats(res.data.stats || {});
        }
      } else if (activeTab === 'transactions') {
        const res = await paymentService.adminGetTransactions({ limit: 100 });
        if (res.data.success) setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Admin load error:', err);
    }
    setLoading(false);
  };

  const handleCancelAppointment = async (id) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;
    try {
      await appointmentService.adminCancel(id, reason);
      toast.success('Appointment cancelled');
      loadData();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handleRefund = async (id) => {
    const reason = prompt('Reason for refund:');
    if (!reason || reason.length < 5) {
      toast.warning('Please provide a refund reason (min 5 chars)');
      return;
    }
    try {
      await paymentService.adminRefund(id, reason);
      toast.success('Payment refunded');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <h3>Please log in as Admin</h3>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard page-wrapper">
      <div className="container">
        <div className="page-header animate-slideUp">
          <h1>Admin Dashboard</h1>
          <p>Manage appointments, payments, and view transaction logs</p>
        </div>

        {/* Stats Summary */}
        {activeTab === 'appointments' && Object.keys(aptStats).length > 0 && (
          <div className="admin-stats animate-fadeIn">
            {Object.entries(aptStats).map(([status, count]) => (
              <div key={status} className="admin-stat-card card">
                <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
                <div className="admin-stat-number">{count}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'payments' && payStats.byStatus && (
          <div className="admin-stats animate-fadeIn">
            <div className="admin-stat-card card highlight">
              <span className="stat-title">Total Revenue</span>
              <div className="admin-stat-number">{formatCurrency(payStats.totalRevenue || 0)}</div>
            </div>
            {Object.entries(payStats.byStatus).map(([status, data]) => (
              <div key={status} className="admin-stat-card card">
                <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
                <div className="admin-stat-number">{data.count}</div>
                <span className="stat-amount">{formatCurrency(data.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            <FiCalendar /> Appointments
          </button>
          <button className={`tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            <FiCreditCard /> Payments
          </button>
          <button className={`tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
            <FiList /> Transaction Logs
          </button>
          <button className="tab refresh-btn" onClick={loadData}><FiRefreshCw /></button>
        </div>

        {loading ? (
          <div className="spinner-overlay"><div className="spinner"></div></div>
        ) : (
          <div className="admin-content card animate-fadeIn" style={{ padding: 0 }}>
            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No appointments found</td></tr>
                  ) : appointments.map(apt => (
                    <tr key={apt._id}>
                      <td className="ref-cell">{apt.appointmentNumber}</td>
                      <td><strong>{apt.patientName}</strong><br/><span className="sub-text">{apt.patientEmail}</span></td>
                      <td>{apt.doctorName}<br/><span className="sub-text">{apt.specialty}</span></td>
                      <td>{formatDate(apt.appointmentDate)}<br/><span className="sub-text">{formatTime(apt.timeSlot.start)} - {formatTime(apt.timeSlot.end)}</span></td>
                      <td className="amount-cell">{formatCurrency(apt.consultationFee)}</td>
                      <td><span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span></td>
                      <td><span className={`badge ${getStatusBadge(apt.paymentStatus)}`}>{apt.paymentStatus}</span></td>
                      <td>
                        {!['cancelled', 'completed'].includes(apt.status) && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancelAppointment(apt._id)}><FiX size={12} /> Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No payments found</td></tr>
                  ) : payments.map(p => (
                    <tr key={p._id}>
                      <td className="ref-cell">{p.transactionRef}</td>
                      <td>{p.patientName}</td>
                      <td>{p.doctorName}</td>
                      <td className="amount-cell">{formatCurrency(p.amount)}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.method}</td>
                      <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                      <td>{getRelativeTime(p.createdAt)}</td>
                      <td>
                        {p.status === 'completed' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleRefund(p._id)}><FiRefreshCw size={12} /> Refund</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Transaction Logs Tab */}
            {activeTab === 'transactions' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Action</th>
                    <th>Previous</th>
                    <th>New Status</th>
                    <th>Amount</th>
                    <th>Performed By</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No transaction logs found</td></tr>
                  ) : transactions.map(t => (
                    <tr key={t._id}>
                      <td className="ref-cell">{t.transactionRef}</td>
                      <td><span className={`badge ${getStatusBadge(t.action)}`}>{t.action}</span></td>
                      <td>{t.previousStatus || '—'}</td>
                      <td><span className={`badge ${getStatusBadge(t.newStatus)}`}>{t.newStatus}</span></td>
                      <td>{formatCurrency(t.amount)}</td>
                      <td>{t.performedBy?.name || 'System'}<br/><span className="sub-text">{t.performedBy?.role}</span></td>
                      <td>{getRelativeTime(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

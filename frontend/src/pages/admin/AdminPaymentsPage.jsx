import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiList, FiCreditCard } from 'react-icons/fi';
import PageBanner from '../../components/common/PageBanner';
import ShellLayout from '../../components/common/ShellLayout';
import { adminNavItems } from '../../utils/navigation';
import paymentService from '../../services/paymentService';
import { formatCurrency, getStatusBadge, getRelativeTime } from '../../utils/formatters';
import '../AdminDashboard.css';

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [payStats, setPayStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'payments') {
        const res = await paymentService.adminGetAll({ limit: 100 });
        if (res.data.success) {
          setPayments(res.data.data);
          setPayStats(res.data.stats || {});
        }
      } else if (activeTab === 'transactions') {
        const res = await paymentService.adminGetTransactions({ limit: 200 });
        if (res.data.success) {
          setTransactions(res.data.data);
        }
      }
    } catch (err) {
      console.error('Admin payments load error:', err);
      toast.error('Failed to load payment data');
    }
    setLoading(false);
  };

  const handleRefund = async (id) => {
    const reason = prompt('Reason for refund:');
    if (!reason || reason.length < 5) {
      toast.warning('Please provide a refund reason (min 5 chars)');
      return;
    }
    try {
      await paymentService.adminRefund(id, reason);
      toast.success('Payment refunded successfully');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed');
    }
  };

  return (
    <ShellLayout
      title="Payments & Revenue"
      subtitle="Track transactions, monitor revenue, and manage refunds."
      navItems={adminNavItems}
    >
      <PageBanner
        eyebrow="Financial Overview"
        title="Payment Management"
        subtitle="View all processed payments, manage transaction logs, and initiate refunds for cancelled services."
        variant="admin-dashboard"
        actions={[
          {
            label: 'Refresh Data',
            className: 'btn btn-primary',
            onClick: loadData
          }
        ]}
      />

      {activeTab === 'payments' && payStats.byStatus && (
        <div className="count-grid" style={{ marginBottom: '24px' }}>
          <article className="count-card card highlight">
            <span className="badge badge-green">Total Revenue</span>
            <strong>{formatCurrency(payStats.totalRevenue || 0)}</strong>
          </article>
          {Object.entries(payStats.byStatus).map(([status, data]) => (
            <article key={status} className="count-card card">
              <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
              <strong>{data.count}</strong>
              <div className="sub-text" style={{ marginTop: '8px' }}>
                {formatCurrency(data.amount)}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="admin-tabs" style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button 
          className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('payments')}
        >
          <FiCreditCard style={{ marginRight: '8px' }} /> Payments
        </button>
        <button 
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('transactions')}
        >
          <FiList style={{ marginRight: '8px' }} /> Transaction Logs
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="spinner-overlay" style={{ minHeight: '300px' }}><div className="spinner"></div></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'payments' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction Ref</th>
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
                      <td className="amount-cell">{formatCurrency(p.amount, p.currency)}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.method}</td>
                      <td><span className={`badge ${getStatusBadge(p.status)}`}>{p.status}</span></td>
                      <td>{getRelativeTime(p.createdAt)}</td>
                      <td>
                        {p.status === 'completed' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleRefund(p._id)}>
                            <FiRefreshCw size={12} style={{ marginRight: '4px' }} /> Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

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
                      <td>{formatCurrency(t.amount, t.currency)}</td>
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
    </ShellLayout>
  );
}

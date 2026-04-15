import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, getStatusBadge, getRelativeTime } from '../../utils/formatters';

const PaymentHistoryList = ({ payments }) => (
  <div className="payments-table-wrap card">
    <table className="payments-table">
      <thead>
        <tr><th>Transaction</th><th>Doctor</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
      </thead>
      <tbody>
        {payments.map(p => (
          <tr key={p._id} className="animate-fadeIn">
            <td><Link to={`/payment/confirm/${p._id}`} className="txn-link">{p.transactionRef}</Link></td>
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
);
export default PaymentHistoryList;

import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar admin-tabs" style={{ flexDirection: 'column' }}>
      <button className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
         Appointments
      </button>
      <button className={`tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
         Payments
      </button>
      <button className={`tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
         Transaction Logs
      </button>
    </div>
  );
};

export default Sidebar;

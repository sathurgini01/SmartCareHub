import React from 'react';

export default function Modal({ title, open, isOpen, onClose, children }) {
  const isModalOpen = open || isOpen;
  if (!isModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel card" onClick={(event) => event.stopPropagation()} style={{ minWidth: 300 }}>
        <div className="modal-header">
          <h2 style={{ marginBottom: 16 }}>{title}</h2>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {/* Supporting both close buttons for legacy compatibility */}
        {!title && <button className="btn btn-ghost" onClick={onClose} style={{ marginTop: 16, width: '100%' }}>Close</button>}
      </div>
    </div>
  );
}

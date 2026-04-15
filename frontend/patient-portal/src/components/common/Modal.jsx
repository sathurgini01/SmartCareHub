import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ minWidth: 300 }}>
        <h3 style={{ marginBottom: 16 }}>{title}</h3>
        {children}
        <button className="btn btn-ghost" onClick={onClose} style={{ marginTop: 16, width: '100%' }}>Close</button>
      </div>
    </div>
  );
};

export default Modal;

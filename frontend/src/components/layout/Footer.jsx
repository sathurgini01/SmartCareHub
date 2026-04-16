import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">⚕️</span>
            <span className="logo-text" style={{ color: 'white' }}>SmartCareHub</span>
          </div>
          <p className="footer-text">© 2024 SmartCareHub. SLIIT Distributed Systems Project.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

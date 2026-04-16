import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        padding: '20px',
      }}
    >
      <div className="card" style={{ textAlign: 'center', maxWidth: '480px', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏥</div>
        <h1 style={{ color: '#dc2626', fontSize: '4rem', margin: '0 0 8px' }}>404</h1>
        <h2 style={{ color: '#f1f5f9', margin: '0 0 12px' }}>Page Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">
            ← Back to Home
          </Link>
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

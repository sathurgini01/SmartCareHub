import React from 'react';

export default function LoadingSpinner({ label = 'Loading...', fullScreen = false }) {
  return (
    <div className={fullScreen ? "spinner-overlay" : "loading"}>
      <div className="spinner" />
      {label && <span>{label}</span>}
    </div>
  );
}

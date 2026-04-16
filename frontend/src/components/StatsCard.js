import React from 'react';

const StatsCard = ({ title, value, className = '', ...props }) => {
  return (
    <div className={`stat-card ${className}`} {...props}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
};

export default StatsCard;
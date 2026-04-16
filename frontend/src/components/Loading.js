import React from 'react';

const Loading = ({ className = '', ...props }) => {
  return (
    <div className={`loading ${className}`} {...props}>
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;
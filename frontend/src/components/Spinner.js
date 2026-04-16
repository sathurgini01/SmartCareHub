import React from 'react';

const Spinner = ({ className = '', ...props }) => {
  return (
    <div className={`spinner ${className}`} {...props}></div>
  );
};

export default Spinner;
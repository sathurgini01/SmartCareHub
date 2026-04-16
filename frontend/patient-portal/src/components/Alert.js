import React from 'react';

const Alert = ({ variant = 'success', children, className = '', ...props }) => {
  const variantClasses = variant === 'success' ? 'alert-success' : 'alert-error';

  return (
    <div className={`${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Alert;
import React from 'react';

const Badge = ({ variant = 'green', children, className = '', ...props }) => {
  const variantClasses = `badge-${variant}`;

  return (
    <span className={`${variantClasses} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
import React from 'react';

const Navbar = ({ children, className = '', ...props }) => {
  return (
    <div className={`navbar ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Navbar;
import React from 'react';

const MainContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`main-content ${className}`} {...props}>
      {children}
    </div>
  );
};

export default MainContent;
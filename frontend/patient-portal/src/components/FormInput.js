import React from 'react';

const FormInput = ({ label, type = 'text', value, onChange, error, className = '', ...props }) => {
  return (
    <div className={className}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="form-input"
        {...props}
      />
      {error && <div className="alert-error">{error}</div>}
    </div>
  );
};

export default FormInput;
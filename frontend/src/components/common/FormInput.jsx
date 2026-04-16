export default function FormInput({
  label,
  error,
  as = 'input',
  className = '',
  children,
  ...props
}) {
  const Component = as;

  return (
    <label className={`form-field ${className}`.trim()}>
      <span className="form-label">{label}</span>
      <Component className="form-input" {...props}>
        {children}
      </Component>
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

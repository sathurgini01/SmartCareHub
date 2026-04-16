export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

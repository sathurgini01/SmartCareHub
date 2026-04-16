export default function Badge({ status, className = '' }) {
  const tone =
    status === 'approved' || status === 'confirmed' || status === 'live'
      ? 'badge-green'
      : status === 'rejected' || status === 'suspended' || status === 'completed'
        ? 'badge-red'
        : 'badge-yellow';

  return <span className={`${tone} ${className}`.trim()}>{status}</span>;
}

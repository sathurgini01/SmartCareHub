function StatIcon({ title, fallback }) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };

  const key = title.toLowerCase();

  if (key.includes('appointment')) {
    return (
      <svg {...commonProps}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    );
  }

  if (key.includes('request')) {
    return (
      <svg {...commonProps}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }

  if (key.includes('availability')) {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </svg>
    );
  }

  if (key.includes('prescription')) {
    return (
      <svg {...commonProps}>
        <path d="M9 3h6" />
        <path d="M10 7h4" />
        <rect x="6" y="3" width="12" height="18" rx="2" />
      </svg>
    );
  }

  if (key.includes('session')) {
    return (
      <svg {...commonProps}>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="M16 10l5-3v10l-5-3z" />
      </svg>
    );
  }

  return <span>{fallback}</span>;
}

export default function StatCard({ title, value, icon, helper }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">
        <StatIcon title={title} fallback={icon} />
      </div>
      <div>
        <p className="stat-title">{title}</p>
        <h3>{value}</h3>
        {helper ? <span className="stat-helper">{helper}</span> : null}
      </div>
    </article>
  );
}

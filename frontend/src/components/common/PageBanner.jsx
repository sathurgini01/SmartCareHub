const bannerImages = {
  'doctor-dashboard':
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1600&q=80',
  'patient-dashboard':
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80',
  'doctor-profile':
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1600&q=80',
  availability:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
  appointments:
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80',
  telemedicine:
    'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80',
  prescriptions:
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80',
  reports:
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80',
  'admin-dashboard':
    'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=1600&q=80',
  'admin-directory':
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
  'admin-profile':
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=1600&q=80',
  'verify-doctors':
    'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1600&q=80'
};

export default function PageBanner({
  eyebrow,
  title,
  subtitle,
  variant = 'doctor-dashboard',
  actions = []
}) {
  return (
    <section
      className={`page-banner card banner-${variant}`}
      style={{ backgroundImage: `linear-gradient(90deg, rgba(8, 16, 29, 0.86), rgba(8, 16, 29, 0.52)), url(${bannerImages[variant] || bannerImages['doctor-dashboard']})` }}
    >
      <div className="page-banner-copy">
        <p className="topbar-kicker">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{subtitle}</p>

        {actions.length ? (
          <div className="page-banner-actions">
            {actions.map((action) => (
              <button
                key={action.label}
                className={action.className}
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

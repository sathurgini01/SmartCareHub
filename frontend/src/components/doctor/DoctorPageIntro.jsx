export default function DoctorPageIntro({
  eyebrow,
  title,
  subtitle,
  image,
  stats = []
}) {
  return (
    <section className="doctor-page-intro card">
      <div className="doctor-page-intro-copy">
        <p className="topbar-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>

        {stats.length ? (
          <div className="doctor-page-intro-stats">
            {stats.map((item) => (
              <article key={item.label} className="doctor-page-intro-stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <div className="doctor-page-intro-visual">
        <div
          className="doctor-page-intro-image"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}

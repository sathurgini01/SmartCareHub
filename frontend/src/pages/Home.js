import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

/* ─── tiny helpers ────────────────────────────────────────────────────────── */
const S = {
  // layout
  page: { fontFamily: "'Segoe UI', Arial, sans-serif", background: '#0a0f1e', color: '#f1f5f9', overflowX: 'hidden' },

  // fixed top navbar
  navbar: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 5%',
    height: '70px',
    background: 'rgba(10,15,30,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(34,197,94,0.25)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: {
    width: '38px', height: '38px', borderRadius: '8px',
    background: 'linear-gradient(135deg,#16a34a,#15803d)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', fontWeight: 900, color: '#fff', flexShrink: 0,
  },
  navTitle: { margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
  navSub: { margin: 0, fontSize: '0.68rem', color: '#16a34a', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 },
  navLinks: { display: 'flex', alignItems: 'center', gap: '32px' },
  navLink: { color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' },
  loginBtn: {
    background: 'linear-gradient(135deg,#16a34a,#15803d)',
    color: '#fff', border: 'none', padding: '10px 26px',
    borderRadius: '8px', fontWeight: 700, fontSize: '0.92rem',
    cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
    boxShadow: '0 4px 15px rgba(34,197,94,0.35)',
    transition: 'all 0.25s',
  },
  disabledBtn: {
    background: '#334155',
    color: '#94a3b8',
    border: '1px solid #475569',
    padding: '10px 26px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.92rem',
    cursor: 'not-allowed',
    textDecoration: 'none',
    display: 'inline-block',
    opacity: 0.7,
  },

  // section wrapper
  section: (bg) => ({ background: bg, padding: '90px 5%' }),
  inner: { maxWidth: '1200px', margin: '0 auto' },
  sectionTag: {
    display: 'inline-block', background: 'rgba(34,197,94,0.12)',
    color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '20px', padding: '4px 14px', fontSize: '0.78rem',
    fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: '16px',
  },
  sectionH2: { fontSize: '2.4rem', fontWeight: 800, color: '#f1f5f9', margin: '0 0 14px', lineHeight: 1.2 },
  sectionP: { color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '620px', margin: '0 0 48px' },
};

/* ─── sub-components ──────────────────────────────────────────────────────── */
const ServiceCard = ({ icon, title, desc, color = '#16a34a' }) => (
  <div
    style={{
      background: '#111827', border: `1px solid rgba(255,255,255,0.06)`,
      borderRadius: '16px', padding: '32px 28px',
      transition: 'transform 0.25s, box-shadow 0.25s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4)`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{
      width: '56px', height: '56px', borderRadius: '14px',
      background: `linear-gradient(135deg, ${color}22, ${color}44)`,
      border: `1px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.6rem', marginBottom: '20px',
    }}>{icon}</div>
    <h3 style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 10px' }}>{title}</h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{desc}</p>
  </div>
);

const StatBox = ({ value, label }) => (
  <div style={{ textAlign: 'center', padding: '0 24px' }}>
    <p style={{ margin: 0, fontSize: '2.6rem', fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>{value}</p>
    <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>{label}</p>
  </div>
);

const Step = ({ num, icon, title, desc }) => (
  <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
    <div style={{
      width: '72px', height: '72px', borderRadius: '50%',
      background: 'linear-gradient(135deg,#16a34a,#15803d)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.8rem', margin: '0 auto 18px',
      boxShadow: '0 8px 24px rgba(34,197,94,0.35)',
    }}>{icon}</div>
    <div style={{
      display: 'inline-block', background: 'rgba(34,197,94,0.15)', color: '#16a34a',
      borderRadius: '20px', padding: '2px 12px', fontSize: '0.75rem',
      fontWeight: 700, marginBottom: '12px',
    }}>Step {num}</div>
    <h3 style={{ color: '#f1f5f9', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 10px' }}>{title}</h3>
    <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
  </div>
);

const ContactItem = ({ icon, label, value, sub }) => (
  <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '28px' }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
      background: 'linear-gradient(135deg,#16a34a22,#16a34a44)',
      border: '1px solid #16a34a44',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
    }}>{icon}</div>
    <div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ margin: '4px 0 2px', color: '#f1f5f9', fontWeight: 600, fontSize: '0.98rem' }}>{value}</p>
      {sub && <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{sub}</p>}
    </div>
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */
const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const { isAuthenticated, isPatient, isAdmin, isDoctor, user } = useAuth();

  const isLoggedIn = isAuthenticated;
  
  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isDoctor) return '/doctor/dashboard';
    if (isPatient) return '/dashboard';
    return '/dashboard';
  };

  const dashboardPath = getDashboardPath();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  };

  return (
    <div style={S.page}>

      {/* ── Fixed Navbar ── */}
      <nav style={{ ...S.navbar, boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.7)' : '0 2px 20px rgba(0,0,0,0.5)' }}>
        <div style={S.navBrand}>
          <div style={S.navLogo}>✚</div>
          <div>
            <p style={S.navTitle}>SmartCareHub</p>
            <p style={S.navSub}>National Health Portal</p>
          </div>
        </div>

        <div style={S.navLinks}>
          {[
            { label: 'Services', id: 'services' },
            { label: 'About Us', id: 'about' },
            { label: 'How It Works', id: 'how' },
            { label: 'Contact', id: 'contact' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                ...S.navLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: activeSection === id ? '#16a34a' : '#94a3b8',
              }}
            >
              {label}
            </button>
          ))}
          {isLoggedIn ? (
            <Link 
              to={dashboardPath} 
              style={(isDoctor && user?.status === 'pending') ? S.disabledBtn : S.loginBtn}
              onClick={(e) => {
                if (isDoctor && user?.status === 'pending') {
                  e.preventDefault();
                  toast.info("Your account is pending approval. You will be able to access the dashboard once an admin reviews your request.");
                } else if (isDoctor && user?.status === 'rejected') {
                  e.preventDefault();
                  toast.error("Your application has been rejected. Please contact support for details.");
                }
              }}
            >
              {(isDoctor && user?.status === 'pending') ? 'Verification Pending' : 'My Dashboard'}
            </Link>
          ) : (
            <Link to="/login" style={S.loginBtn}>Login</Link>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(145deg,#0a0f1e 0%,#0f172a 50%,#0a0f1e 100%)',
        position: 'relative', overflow: 'hidden', paddingTop: '70px',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-200px', right: '-200px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-200px', left: '-200px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(34,197,94,0.05) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ ...S.inner, width: '100%', padding: '60px 5%', position: 'relative', display: 'flex', alignItems: 'center', gap: '60px' }}>
          <div style={{ flex: '1 1 480px', minWidth: '280px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '20px', padding: '6px 16px', marginBottom: '28px',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Platform is live and operational</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 900, lineHeight: 1.1,
              margin: '0 0 24px', color: '#f1f5f9',
            }}>
              Your Health,{' '}
              <span style={{
                background: 'linear-gradient(90deg,#16a34a,#22c55e)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Managed Smartly
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.75,
              margin: '0 0 36px', maxWidth: '620px',
            }}>
              Sri Lanka's AI-enabled cloud-native healthcare platform. Book doctor
              appointments, attend telemedicine consultations, upload medical reports, and
              receive AI-powered health suggestions — all in one place.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '64px' }}>
              <Link
                to="/register"
                style={{
                  background: 'linear-gradient(135deg,#16a34a,#15803d)',
                  color: '#fff', textDecoration: 'none', padding: '14px 36px',
                  borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
                  transition: 'all 0.25s', display: 'inline-block',
                }}
              >
                Get Started — It's Free
              </Link>
              <button
                onClick={() => scrollTo('how')}
                style={{
                  background: 'transparent', border: '1.5px solid #334155',
                  color: '#94a3b8', padding: '14px 32px', borderRadius: '10px',
                  fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                  transition: 'all 0.25s',
                }}
              >
                How It Works
              </button>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0',
              borderTop: '1px solid #1e293b', paddingTop: '36px',
            }}>
              {[
                { value: '24/7', label: 'Telemedicine Access' },
                { value: '100+', label: 'Verified Doctors' },
                { value: '10K+', label: 'Active Patients' },
                { value: '50+', label: 'Specialties' },
              ].map(({ value, label }, i) => (
                <React.Fragment key={label}>
                  <StatBox value={value} label={label} />
                  {i < 3 && <div style={{ width: '1px', background: '#1e293b', margin: '0 4px' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── Right: Healthcare Illustration ── */}
          <div style={{ flex: '0 0 420px', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 420 460" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '420px', filter: 'drop-shadow(0 20px 60px rgba(34,197,94,0.15))' }}>

              {/* Outer glow circle */}
              <circle cx="210" cy="230" r="190" fill="url(#bgGlow)" opacity="0.4" />

              {/* Main card — doctor screen */}
              <rect x="60" y="80" width="300" height="300" rx="24" fill="#111827" stroke="#1e293b" strokeWidth="1.5" />
              <rect x="60" y="80" width="300" height="6" rx="3" fill="url(#redGrad)" />

              {/* Top bar */}
              <circle cx="88" cy="108" r="7" fill="#16a34a" opacity="0.8" />
              <rect x="104" y="102" width="80" height="12" rx="6" fill="#1e293b" />
              <rect x="296" y="102" width="48" height="12" rx="6" fill="#1e293b" />

              {/* Doctor avatar circle */}
              <circle cx="210" cy="180" r="52" fill="#0f172a" stroke="#16a34a" strokeWidth="2" />
              <circle cx="210" cy="168" r="22" fill="#1e293b" />
              <ellipse cx="210" cy="205" rx="32" ry="18" fill="#1e293b" />
              {/* Stethoscope */}
              <path d="M196 205 Q188 218 192 228 Q196 238 206 238 Q216 238 220 228 Q224 218 216 205" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="206" cy="240" r="5" fill="#16a34a" opacity="0.9" />
              {/* Face */}
              <circle cx="202" cy="165" r="3" fill="#94a3b8" />
              <circle cx="218" cy="165" r="3" fill="#94a3b8" />
              <path d="M204 174 Q210 179 216 174" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Head/hair */}
              <path d="M188 162 Q188 148 210 146 Q232 148 232 162" fill="#475569" />
              {/* White coat collar */}
              <path d="M185 200 L192 193 L210 196 L228 193 L235 200" stroke="#e2e8f0" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* Heartbeat line */}
              <rect x="76" y="248" width="268" height="40" rx="8" fill="#0a0f1e" stroke="#1e293b" strokeWidth="1" />
              <polyline points="80,268 100,268 112,252 122,284 132,258 142,268 160,268 172,268 184,252 194,284 204,268 268,268 280,268" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="280" cy="268" r="4" fill="#16a34a" />
              <text x="290" y="272" fill="#16a34a" fontSize="10" fontWeight="700" fontFamily="monospace">LIVE</text>

              {/* Info pills at bottom of card */}
              <rect x="76" y="302" width="82" height="28" rx="8" fill="#0a0f1e" stroke="#1e293b" strokeWidth="1" />
              <text x="117" y="320" fill="#22c55e" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">● Online</text>

              <rect x="168" y="302" width="82" height="28" rx="8" fill="#0a0f1e" stroke="#1e293b" strokeWidth="1" />
              <text x="209" y="320" fill="#94a3b8" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">📅 Book Now</text>

              <rect x="260" y="302" width="82" height="28" rx="8" fill="#0a0f1e" stroke="#1e293b" strokeWidth="1" />
              <text x="301" y="320" fill="#6366f1" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">📹 Video Call</text>

              {/* Floating badge — AI */}
              <rect x="290" y="56" width="110" height="44" rx="12" fill="#111827" stroke="#6366f155" strokeWidth="1.5" />
              <text x="316" y="74" fill="#6366f1" fontSize="11" fontWeight="800" fontFamily="sans-serif">🤖 AI</text>
              <text x="308" y="89" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Symptom Check</text>

              {/* Floating badge — Secure */}
              <rect x="18" y="140" width="100" height="44" rx="12" fill="#111827" stroke="#22c55e55" strokeWidth="1.5" />
              <text x="30" y="158" fill="#22c55e" fontSize="11" fontWeight="800" fontFamily="sans-serif">🔐 Secure</text>
              <text x="28" y="173" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">JWT + Role Auth</text>

              {/* Floating badge — Prescription */}
              <rect x="18" y="300" width="106" height="44" rx="12" fill="#111827" stroke="#f59e0b55" strokeWidth="1.5" />
              <text x="26" y="318" fill="#f59e0b" fontSize="11" fontWeight="800" fontFamily="sans-serif">💊 Rx Ready</text>
              <text x="26" y="333" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Digital Prescriptions</text>

              {/* Bottom label */}
              <rect x="110" y="400" width="200" height="36" rx="10" fill="#111827" stroke="#16a34a33" strokeWidth="1.5" />
              <text x="210" y="423" fill="#16a34a" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">SmartCareHub</text>

              <defs>
                <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#0a0f1e" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" style={S.section('#0d1321')}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={S.sectionTag}>Our Services</span>
            <h2 style={{ ...S.sectionH2, maxWidth: '600px', margin: '0 auto 16px' }}>
              Everything You Need for Your Healthcare
            </h2>
            <p style={{ ...S.sectionP, margin: '0 auto', textAlign: 'center' }}>
              A fully integrated microservices platform delivering end-to-end digital healthcare
              for patients, doctors, and administrators.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: '24px',
          }}>
            <ServiceCard icon="👨‍⚕️" color="#16a34a" title="Doctor Management" desc="Browse verified doctors by specialty. View full profiles, qualifications, and availability before booking." />
            <ServiceCard icon="📅" color="#f59e0b" title="Appointment Booking" desc="Search, book, modify, or cancel appointments in real time with instant status tracking." />
            <ServiceCard icon="📹" color="#6366f1" title="Video Consultations" desc="Attend secure telemedicine sessions via Agora/Twilio integration from the comfort of your home." />
            <ServiceCard icon="📄" color="#10b981" title="Medical Reports" desc="Upload, store, and share medical documents and lab reports securely with your care team." />
            <ServiceCard icon="💊" color="#ec4899" title="Digital Prescriptions" desc="Receive and access doctor-issued digital prescriptions with full medication details anytime." />
            <ServiceCard icon="🤖" color="#06b6d4" title="AI Symptom Checker" desc="Input your symptoms and receive AI-powered preliminary health suggestions and recommended specialties." />
            <ServiceCard icon="💳" color="#84cc16" title="Secure Payments" desc="Pay consultation fees securely via PayHere, Dialog Genie, Stripe or PayPal sandbox integrations." />
            <ServiceCard icon="🔔" color="#22c55e" title="Smart Notifications" desc="Get instant SMS and email confirmations for appointments, consultations, and prescriptions." />
            <ServiceCard icon="🔐" color="#8b5cf6" title="Role-Based Security" desc="JWT authentication with separate access controls for patients, doctors, and administrators." />
          </div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section id="about" style={S.section('#0a0f1e')}>
        <div style={{ ...S.inner, display: 'flex', gap: '80px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Left — visual */}
          <div style={{ flex: '0 0 340px', minWidth: '260px' }}>
            <div style={{
              background: 'linear-gradient(145deg,#111827,#1e293b)',
              border: '1px solid #1e293b', borderRadius: '20px', padding: '36px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: 'linear-gradient(90deg,#16a34a,#22c55e)',
              }} />
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🏥</div>
                <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 800 }}>SmartCareHub</h3>
                <p style={{ margin: '4px 0 0', color: '#16a34a', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>National Health Portal</p>
              </div>
              {[
                { label: 'Platform Type', value: 'Cloud-Native Microservices' },
                { label: 'Architecture', value: 'Docker + Kubernetes' },
                { label: 'Framework', value: 'React + Node.js' },
                { label: 'Database', value: 'MongoDB' },
                { label: 'Auth', value: 'JWT Role-Based Access' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid #1e293b', fontSize: '0.85rem',
                }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — text */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <span style={S.sectionTag}>About Us</span>
            <h2 style={S.sectionH2}>
              Transforming Healthcare<br />Through Technology
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, marginBottom: '24px', fontSize: '0.98rem' }}>
              SmartCareHub is a next-generation telemedicine and healthcare management platform
              developed as part of the SE3020 Distributed Systems module at SLIIT. It is modelled
              after real-world systems such as <strong style={{ color: '#f1f5f9' }}>Channeling.lk</strong>, <strong style={{ color: '#f1f5f9' }}>oDoc</strong>, and <strong style={{ color: '#f1f5f9' }}>mHealth</strong>.
            </p>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, marginBottom: '36px', fontSize: '0.98rem' }}>
              Built using a fully distributed microservices architecture, every service —
              Authentication, Patient Management, Doctor Management, Appointments, Payments,
              Notifications, Telemedicine, and AI — operates independently, ensuring
              scalability, security, and fault tolerance.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { icon: '🎯', title: 'Our Mission', desc: 'Make quality healthcare accessible to every Sri Lankan through digital innovation.' },
                { icon: '🛡️', title: 'Security First', desc: 'Enterprise-grade JWT authentication with full role-based access control.' },
                { icon: '☁️', title: 'Cloud Native', desc: 'Deployed on Kubernetes with Docker containers for maximum reliability.' },
                { icon: '🤝', title: 'Patient First', desc: 'Every feature designed around the patient experience and health outcomes.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                  <h4 style={{ color: '#f1f5f9', margin: '10px 0 6px', fontSize: '0.95rem' }}>{title}</h4>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.83rem', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" style={S.section('#0d1321')}>
        <div style={S.inner}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={S.sectionTag}>How It Works</span>
            <h2 style={{ ...S.sectionH2, maxWidth: '500px', margin: '0 auto 14px' }}>
              Get Started in 3 Simple Steps
            </h2>
            <p style={{ color: '#94a3b8', margin: '0 auto', maxWidth: '500px' }}>
              From registration to consultation — SmartCareHub makes your healthcare journey seamless.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            <Step num={1} icon="📝" title="Register & Create Profile" desc="Sign up in minutes. Complete your patient profile with medical history and personal details." />
            <div style={{ display: 'flex', alignItems: 'center', color: '#334155', fontSize: '1.5rem', flexShrink: 0, marginTop: '-24px' }}>→</div>
            <Step num={2} icon="🔍" title="Find & Book a Doctor" desc="Search doctors by specialty, view their profiles and availability, and book an appointment." />
            <div style={{ display: 'flex', alignItems: 'center', color: '#334155', fontSize: '1.5rem', flexShrink: 0, marginTop: '-24px' }}>→</div>
            <Step num={3} icon="📹" title="Consult & Get Prescriptions" desc="Attend your video consultation and receive digital prescriptions directly in your portal." />
          </div>

          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <Link to="/register" style={{
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              color: '#fff', textDecoration: 'none', padding: '14px 40px',
              borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(34,197,94,0.35)', display: 'inline-block',
            }}>
              Create Your Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact Us ── */}
      <section id="contact" style={S.section('#0a0f1e')}>
        <div style={{ ...S.inner, display: 'flex', gap: '80px', flexWrap: 'wrap' }}>

          {/* Left — info */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <span style={S.sectionTag}>Contact Us</span>
            <h2 style={S.sectionH2}>We're Here to Help</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, marginBottom: '40px', fontSize: '0.98rem' }}>
              Have questions about the platform, your account, or our services? Our support
              team is available to assist you. Reach out through any of the channels below.
            </p>

            <ContactItem
              icon="📍"
              label="Head Office"
              value="New Kandy Road, Malabe, Sri Lanka"
              sub="SLIIT Campus, Information Technology Faculty"
            />
            <ContactItem
              icon="📞"
              label="Support Hotline"
              value="+94 11 754 4801"
              sub="Monday – Friday, 8:00 AM – 6:00 PM"
            />
            <ContactItem
              icon="📧"
              label="Email Support"
              value="support@smartcarehub.lk"
              sub="We respond within 24 business hours"
            />
            <ContactItem
              icon="🕐"
              label="Platform Hours"
              value="24 / 7 Online Access"
              sub="Telemedicine available around the clock"
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              {['Facebook', 'Twitter', 'LinkedIn', 'YouTube'].map((s) => (
                <div key={s} style={{
                  background: '#111827', border: '1px solid #1e293b',
                  borderRadius: '8px', padding: '10px 16px',
                  color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                }}>{s}</div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{
              background: '#111827', border: '1px solid #1e293b',
              borderRadius: '20px', padding: '40px',
            }}>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 24px', fontSize: '1.2rem', fontWeight: 700 }}>
                Send Us a Message
              </h3>

              {[
                { label: 'Full Name', type: 'text', placeholder: 'John Perera' },
                { label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
                { label: 'Subject', type: 'text', placeholder: 'How can we help?' },
              ].map(({ label, type, placeholder }) => (
                <div key={label} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '8px',
                      background: '#0a0f1e', border: '1px solid #1e293b',
                      color: '#f1f5f9', fontSize: '0.9rem', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Message
                </label>
                <textarea
                  placeholder="Describe your inquiry in detail…"
                  rows={5}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '8px',
                    background: '#0a0f1e', border: '1px solid #1e293b',
                    color: '#f1f5f9', fontSize: '0.9rem', outline: 'none',
                    resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
              </div>

              <button style={{
                width: '100%', background: 'linear-gradient(135deg,#16a34a,#15803d)',
                color: '#fff', border: 'none', padding: '13px',
                borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
              }}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#060b17', borderTop: '1px solid #0f172a', padding: '60px 5% 28px' }}>
        <div style={{ ...S.inner }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '48px', marginBottom: '48px' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ ...S.navLogo, width: '32px', height: '32px', fontSize: '1rem' }}>✚</div>
                <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.1rem' }}>SmartCareHub</span>
              </div>
              <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
                Sri Lanka's AI-enabled national telemedicine and healthcare appointment platform.
                Built with Microservices, Docker &amp; Kubernetes.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 style={{ color: '#f1f5f9', margin: '0 0 18px', fontSize: '0.9rem', fontWeight: 700 }}>Services</h4>
              {['Patient Portal', 'Doctor Management', 'Appointment Booking', 'Telemedicine', 'Digital Prescriptions', 'AI Symptom Checker'].map(s => (
                <p key={s} style={{ margin: '0 0 10px', color: '#475569', fontSize: '0.85rem', cursor: 'pointer' }}>{s}</p>
              ))}
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: '#f1f5f9', margin: '0 0 18px', fontSize: '0.9rem', fontWeight: 700 }}>Quick Links</h4>
              {[
                { label: 'Sign In', to: '/login' },
                { label: 'Register', to: '/register' },
              ].map(({ label, to }) => (
                <p key={label} style={{ margin: '0 0 10px' }}>
                  <Link to={to} style={{ color: '#475569', fontSize: '0.85rem', textDecoration: 'none' }}>{label}</Link>
                </p>
              ))}
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <p key={l} style={{ margin: '0 0 10px', color: '#475569', fontSize: '0.85rem', cursor: 'pointer' }}>{l}</p>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: '#f1f5f9', margin: '0 0 18px', fontSize: '0.9rem', fontWeight: 700 }}>Contact</h4>
              <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.7, margin: '0 0 10px' }}>New Kandy Road, Malabe, Sri Lanka</p>
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0 0 6px' }}>📞 +94 11 754 4801</p>
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>📧 support@smartcarehub.lk</p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #0f172a', paddingTop: '24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
          }}>
            <p style={{ color: '#334155', fontSize: '0.82rem', margin: 0 }}>
              © 2026 SmartCareHub — SE3020 Distributed Systems · BSc (Hons) IT Specialized in Software Engineering · SLIIT
            </p>
            <p style={{ color: '#334155', fontSize: '0.82rem', margin: 0 }}>
              Built with React · Node.js · MongoDB · Docker · Kubernetes
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;


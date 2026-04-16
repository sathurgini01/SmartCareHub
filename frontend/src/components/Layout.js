import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Sidebar nav items — Profile is intentionally NOT here */
const NAV_LINKS = [
  { to: '/dashboard',    label: 'Dashboard',     icon: '🏠', desc: 'Overview' },
  { to: '/prescriptions',label: 'Prescriptions', icon: '💊', desc: 'Your medicines' },
  { to: '/appointments', label: 'Appointments',  icon: '📅', desc: 'Bookings' },
  { to: '/upload-report',label: 'Upload Report', icon: '📤', desc: 'Medical files' },
];

const Layout = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e' }}>
        <div style={{
          border: '3px solid #1e293b', borderTop: '3px solid #dc2626',
          borderRadius: '50%', width: '44px', height: '44px',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const initial = (user?.name || 'P').charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: '256px', flexShrink: 0,
        background: '#0d1321',
        borderRight: '1px solid #1e293b',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 200,
      }}>

        {/* Logo */}
        <div style={{ padding: '24px 22px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
              background: 'linear-gradient(135deg,#dc2626,#991b1b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 900, color: '#fff',
            }}>✚</div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: '#f1f5f9', fontSize: '1rem', letterSpacing: '-0.3px' }}>SmartCareHub</p>
              <p style={{ margin: 0, fontSize: '0.65rem', color: '#dc2626', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <p style={{ margin: '20px 22px 8px', fontSize: '0.67rem', color: '#475569', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Navigation
        </p>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
          {NAV_LINKS.map(({ to, label, icon, desc }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '13px',
                padding: '11px 13px', borderRadius: '10px', marginBottom: '3px',
                textDecoration: 'none',
                background: isActive ? 'rgba(220,38,38,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(220,38,38,0.25)' : '1px solid transparent',
                transition: 'all 0.18s',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{
                    width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
                    background: isActive ? 'rgba(220,38,38,0.15)' : '#1e293b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                  }}>{icon}</span>
                  <div>
                    <p style={{ margin: 0, color: isActive ? '#f1f5f9' : '#94a3b8', fontWeight: isActive ? 700 : 500, fontSize: '0.88rem' }}>{label}</p>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.72rem' }}>{desc}</p>
                  </div>
                  {isActive && (
                    <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid #1e293b' }}>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 13px', borderRadius: '10px', border: '1px solid #1e293b',
              background: 'transparent', cursor: 'pointer', color: '#64748b',
              fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#f1f5f9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <span style={{ fontSize: '1rem' }}>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Right Panel ──────────────────────────────────────────────────── */}
      <div style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top Navbar */}
        <header style={{
          height: '64px',
          background: '#0d1321',
          borderBottom: '1px solid #1e293b',
          display: 'flex', alignItems: 'center',
          padding: '0 28px',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          {/* Left — Page breadcrumb */}
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem' }}>
              SmartCareHub /{' '}
              <span style={{ color: '#94a3b8' }}>Patient Portal</span>
            </p>
          </div>

          {/* Right — Date + Profile button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem', display: 'none' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>

            {/* Home button */}
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '10px', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8',
                flexShrink: 0,
              }}
              title="Go to Home"
            >🏠</button>

            {/* Notification bell (decorative) */}
            <button style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: '10px', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '1rem', color: '#94a3b8',
              flexShrink: 0,
            }}>🔔</button>

            {/* ── Profile Button (top right only) ── */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: dropdownOpen ? '#1e293b' : 'rgba(220,38,38,0.08)',
                  border: `1px solid ${dropdownOpen ? '#334155' : 'rgba(220,38,38,0.25)'}`,
                  borderRadius: '10px', padding: '6px 14px 6px 6px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: '#fff', fontSize: '0.95rem', flexShrink: 0,
                }}>
                  {initial}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '0.83rem', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name}
                  </p>
                  <p style={{ margin: 0, color: '#dc2626', fontSize: '0.68rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {user?.role || 'patient'}
                  </p>
                </div>
                <span style={{ color: '#475569', fontSize: '0.7rem', marginLeft: '2px' }}>
                  {dropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: '#111827', border: '1px solid #1e293b',
                  borderRadius: '14px', minWidth: '220px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                  overflow: 'hidden', zIndex: 999,
                }}>
                  {/* User info header */}
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: 'linear-gradient(135deg,#dc2626,#991b1b)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, color: '#fff', fontSize: '1.1rem', flexShrink: 0,
                      }}>{initial}</div>
                      <div>
                        <p style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</p>
                        <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.78rem' }}>{user?.email || 'patient@smartcarehub.lk'}</p>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '10px', background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.25)', borderRadius: '6px',
                      padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      <span style={{ color: '#22c55e', fontSize: '0.72rem', fontWeight: 700 }}>Active Account</span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '8px' }}>
                    {[
                      { icon: '👤', label: 'My Profile', action: () => { navigate('/profile'); setDropdownOpen(false); } },
                      { icon: '💊', label: 'Prescriptions', action: () => { navigate('/prescriptions'); setDropdownOpen(false); } },
                      { icon: '📅', label: 'Appointments', action: () => { navigate('/appointments'); setDropdownOpen(false); } },
                      { icon: '📤', label: 'Upload Report', action: () => { navigate('/upload-report'); setDropdownOpen(false); } },
                    ].map(({ icon, label, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 12px', borderRadius: '8px', border: 'none',
                          background: 'transparent', cursor: 'pointer', color: '#94a3b8',
                          fontSize: '0.87rem', fontWeight: 500, textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#f1f5f9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        <span style={{ fontSize: '1rem' }}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Sign out */}
                  <div style={{ padding: '8px', borderTop: '1px solid #1e293b' }}>
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '8px',
                        border: '1px solid rgba(239,68,68,0.2)',
                        background: 'rgba(239,68,68,0.05)', cursor: 'pointer',
                        color: '#ef4444', fontSize: '0.87rem', fontWeight: 600,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                    >
                      <span style={{ fontSize: '1rem' }}>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 32px', background: '#0a0f1e', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

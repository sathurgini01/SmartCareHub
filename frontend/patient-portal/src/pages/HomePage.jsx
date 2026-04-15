import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiCalendar, FiCreditCard, FiShield, FiArrowRight, FiStar, FiClock, FiHeart } from 'react-icons/fi';
import { getSpecialtyIcon } from '../utils/formatters';
import './HomePage.css';

const specialties = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Neurology',
  'Orthopedics', 'Pediatrics', 'Gynecology', 'Dental', 'ENT', 'Ophthalmology', 'Psychiatry'
];

const stats = [
  { number: '50+', label: 'Expert Doctors' },
  { number: '10K+', label: 'Patients Served' },
  { number: '11', label: 'Specialties' },
  { number: '4.8', label: 'Average Rating' }
];

const steps = [
  { icon: <FiSearch />, title: 'Search Doctors', desc: 'Browse through our expert doctors by specialty, rating, or availability.' },
  { icon: <FiCalendar />, title: 'Book Appointment', desc: 'Pick a convenient date and time slot that works for you.' },
  { icon: <FiCreditCard />, title: 'Make Payment', desc: 'Securely pay via PayHere, Sri Lanka\'s trusted payment gateway.' },
  { icon: <FiHeart />, title: 'Get Treated', desc: 'Visit your doctor at the scheduled time and receive quality care.' }
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text animate-slideUp">
            <div className="hero-badge">
              <FiShield /> Trusted Healthcare Platform
            </div>
            <h1>Book Doctor Appointments <span className="gradient-text">With Confidence</span></h1>
            <p>Find the right specialist, book instantly, and pay securely — all in one place. Trusted by thousands across Sri Lanka.</p>
            <div className="hero-actions">
              <Link to="/doctors" className="btn btn-primary btn-lg">
                Find a Doctor <FiArrowRight />
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Get Started
                </Link>
              )}
            </div>
          </div>
          <div className="hero-visual animate-fadeIn">
            <div className="hero-card-stack">
              <div className="hero-card hero-card-1">
                <div className="hero-card-icon">🩺</div>
                <div>
                  <div className="hero-card-title">Dr. Ashan Fernando</div>
                  <div className="hero-card-sub">Cardiology • ⭐ 4.8</div>
                </div>
              </div>
              <div className="hero-card hero-card-2">
                <div className="hero-card-icon">📅</div>
                <div>
                  <div className="hero-card-title">Appointment Confirmed</div>
                  <div className="hero-card-sub">Tomorrow at 10:00 AM</div>
                </div>
              </div>
              <div className="hero-card hero-card-3">
                <div className="hero-card-icon">✅</div>
                <div>
                  <div className="hero-card-title">Payment Successful</div>
                  <div className="hero-card-sub">LKR 3,500.00 via PayHere</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item animate-scaleIn" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="specialties-section">
        <div className="container">
          <div className="section-header">
            <h2>Browse by Specialty</h2>
            <p>Find the right specialist for your healthcare needs</p>
          </div>
          <div className="specialties-grid stagger-children">
            {specialties.map((spec) => (
              <Link 
                key={spec} 
                to={`/doctors?specialty=${encodeURIComponent(spec)}`}
                className="specialty-card animate-fadeIn"
              >
                <span className="specialty-icon">{getSpecialtyIcon(spec)}</span>
                <span className="specialty-name">{spec}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Book your appointment in 4 simple steps</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card animate-slideUp" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="step-number">{i + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Book Your Appointment?</h2>
            <p>Join thousands of patients who trust SmartCareHub for their healthcare needs</p>
            <Link to="/doctors" className="btn btn-accent btn-lg">
              Browse Doctors <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-icon">⚕️</span>
              <span className="logo-text" style={{ color: 'white' }}>SmartCareHub</span>
            </div>
            <p className="footer-text">© 2024 SmartCareHub. SLIIT Distributed Systems Project.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

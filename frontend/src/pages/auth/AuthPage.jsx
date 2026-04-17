import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import FormInput from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';

const tabs = [
  { id: 'doctor-login', title: 'Doctor Login', role: 'doctor', mode: 'login' },
  { id: 'doctor-register', title: 'Doctor Register', role: 'doctor', mode: 'register' },
  { id: 'admin-login', title: 'Admin Login', role: 'admin', mode: 'login' },
  { id: 'admin-register', title: 'Admin Register', role: 'admin', mode: 'register' }
];

const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'doctor') return '/doctor/dashboard';
  return '/dashboard';
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loginUser, registerUser } = useAuth();
  const [activeTab, setActiveTab] = useState('doctor-login');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    hospital: '',
    profileImage: '',
    accessKey: ''
  });

  const selected = useMemo(() => tabs.find((tab) => tab.id === activeTab), [activeTab]);

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      if (selected.mode === 'register' && form.password !== form.confirmPassword) {
        throw new Error('Password and confirm password do not match.');
      }

      if (selected.mode === 'login') {
        const result = await loginUser({ email: form.email, password: form.password, role: selected.role });
        navigate(getDashboardPath(result?.user?.role || selected.role));
      } else {
        await registerUser(selected.role, {
          name: form.fullName,
          email: form.email,
          password: form.password,
          role: selected.role
        });
        setAlert({ type: 'success', message: `${selected.role} registration successful. Redirecting...` });
        setTimeout(() => {
          navigate(getDashboardPath(selected.role));
        }, 1500);
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-hero card">
        <p className="topbar-kicker">Smart Healthcare Platform</p>
        <h1>Doctor and Admin Access Portal</h1>
        <p>
          Manage doctor verification, digital appointments, telemedicine, reports, and prescriptions
          from one secure university-demo-ready healthcare interface.
        </p>

        <div className="hero-illustration">
          <div className="hero-doctor">
            <div className="hero-dot one" />
            <div className="hero-dot two" />
            <div className="hero-dot three" />
          </div>
        </div>

        <div className="hero-feature-list">
          <div className="hero-feature card">
            <strong>Doctor Verification</strong>
            <span>Admin approval workflow with detailed review panel.</span>
          </div>
          <div className="hero-feature card">
            <strong>Telemedicine Ready</strong>
            <span>Professional consultation layout prepared for Jitsi or Twilio.</span>
          </div>
          <div className="hero-feature card">
            <strong>Prescription Workspace</strong>
            <span>Digital medication rows, previews, history, and follow-up tracking.</span>
          </div>
        </div>
      </section>

      <section className="auth-card card">
        <div className="portal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`portal-tab ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {alert ? (
          <div className={alert.type === 'error' ? 'alert-error' : 'alert-success'}>
            {alert.message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>{selected.title}</h2>
            <p>{selected.mode === 'login' ? 'Access your dashboard securely.' : 'Create a new platform account.'}</p>
          </div>

          <div className="form-grid">
            {selected.mode === 'register' ? (
              <FormInput
                label="Full Name"
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              />
            ) : null}

            <FormInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />

            <div className="password-group">
              <FormInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
              <button
                type="button"
                className="inline-toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {selected.mode === 'register' ? (
              <div className="password-group">
                <FormInput
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                />
                <button
                  type="button"
                  className="inline-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            ) : null}

            {selected.id === 'doctor-register' ? (
              <>
                <FormInput
                  label="Specialization"
                  value={form.specialization}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, specialization: event.target.value }))
                  }
                />
                <FormInput
                  label="License Number"
                  value={form.licenseNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, licenseNumber: event.target.value }))
                  }
                />
                <FormInput
                  label="Experience"
                  type="number"
                  value={form.experience}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, experience: event.target.value }))
                  }
                />
                <FormInput
                  label="Hospital / Clinic"
                  value={form.hospital}
                  onChange={(event) => setForm((current) => ({ ...current, hospital: event.target.value }))}
                />
                <FormInput
                  label="Profile Image Upload"
                  type="file"
                  className="field-span-2"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      profileImage: event.target.files?.[0]?.name || ''
                    }))
                  }
                />
              </>
            ) : null}

            {selected.id === 'admin-register' ? (
              <FormInput
                label="Admin Code / Access Key"
                value={form.accessKey}
                onChange={(event) => setForm((current) => ({ ...current, accessKey: event.target.value }))}
              />
            ) : null}
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : selected.mode === 'login' ? 'Secure Login' : 'Submit Registration'}
          </button>
        </form>
      </section>
    </div>
  );
}

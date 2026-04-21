import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
  FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  checkSymptoms,
  createSymptomNotification,
  deleteSymptomHistory,
  escalateSymptomCheck,
  getSymptomHistory,
  recommendConsultation,
} from '../../api/aiSymptomApi';
import { sendEmailNotification } from '../../api/notificationApi';

const emptyForm = {
  symptoms: '',
  age: '',
  gender: '',
  duration: '',
  notes: '',
};

const normalizeRisk = (risk) => (risk || 'low').toLowerCase();

const riskMeta = {
  low: {
    label: 'Low Risk',
    tone: '#22c55e',
    bg: 'rgba(34,197,94,0.14)',
    border: 'rgba(34,197,94,0.32)',
    icon: FiCheckCircle,
  },
  medium: {
    label: 'Medium Risk',
    tone: '#f59e0b',
    bg: 'rgba(245,158,11,0.14)',
    border: 'rgba(245,158,11,0.36)',
    icon: FiAlertTriangle,
  },
  high: {
    label: 'High Risk',
    tone: '#ef4444',
    bg: 'rgba(239,68,68,0.16)',
    border: 'rgba(239,68,68,0.42)',
    icon: FiZap,
  },
};

function AiSymptomChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.id || user?._id || user?.userId;

  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resultRisk = normalizeRisk(result?.riskLevel);
  const currentRiskMeta = riskMeta[resultRisk] || riskMeta.low;
  const RiskIcon = currentRiskMeta.icon;

  const stats = useMemo(() => ({
    total: history.length,
    low: history.filter((item) => normalizeRisk(item.riskLevel) === 'low').length,
    high: history.filter((item) => normalizeRisk(item.riskLevel) === 'high').length,
    medium: history.filter((item) => normalizeRisk(item.riskLevel) === 'medium').length,
  }), [history]);

  useEffect(() => {
    if (!patientId) return;

    setHistoryLoading(true);
    getSymptomHistory(patientId)
      .then((response) => setHistory(response.data.data || []))
      .catch(() => setError('Could not load symptom history right now.'))
      .finally(() => setHistoryLoading(false));
  }, [patientId]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const notifyIfNeeded = async (analysis) => {
    const risk = normalizeRisk(analysis?.riskLevel);
    if (!['medium', 'high'].includes(risk) || !analysis?._id) return;

    await createSymptomNotification(analysis._id).catch(() => null);

    if (user?.email) {
      await sendEmailNotification({
        userId: patientId,
        recipientEmail: user.email,
        subject: `SmartCareHub ${riskMeta[risk].label} Symptom Alert`,
        category: 'ai-symptom',
        message: `Your symptom check was marked as ${riskMeta[risk].label}. Recommended specialty: ${analysis.recommendedSpecialty || 'General Medicine'}. Please book a consultation if symptoms continue or worsen.`,
      }).catch(() => null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!patientId) {
      setError('Your patient session is still loading. Please try again in a moment.');
      return;
    }

    if (form.symptoms.trim().length < 5) {
      setError('Please describe your symptoms in at least 5 characters.');
      return;
    }

    if (!form.age || Number(form.age) < 1 || Number(form.age) > 120) {
      setError('Please enter a valid age between 1 and 120.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await checkSymptoms(patientId, form);
      const analysis = response.data.data;
      setResult(analysis);
      setHistory((previous) => [analysis, ...previous.filter((item) => item._id !== analysis._id)]);
      setSuccess('Analysis completed. Your result is saved in symptom history.');
      await notifyIfNeeded(analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToDoctors = () => {
    navigate('/doctors');
  };

  const handleRecommendConsultation = async () => {
    if (!result?._id) {
      goToDoctors();
      return;
    }

    setActionLoading('consultation');
    await recommendConsultation(result._id).catch(() => null);
    setActionLoading('');
    goToDoctors();
  };

  const handleEscalate = async () => {
    if (!result?._id) return;

    setActionLoading('escalate');
    setError('');
    try {
      await escalateSymptomCheck(result._id);
      setSuccess('High-risk case escalated. Please book a consultation as soon as possible.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not escalate this case.');
    } finally {
      setActionLoading('');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;

    setActionLoading(deleteTarget._id);
    setError('');
    try {
      await deleteSymptomHistory(deleteTarget._id);
      setHistory((previous) => previous.filter((item) => item._id !== deleteTarget._id));
      if (result?._id === deleteTarget._id) setResult(null);
      setDeleteTarget(null);
      setSuccess('History item deleted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this history item.');
    } finally {
      setActionLoading('');
    }
  };

  const renderHistoryItem = (item) => {
    const risk = normalizeRisk(item.riskLevel);
    const meta = riskMeta[risk] || riskMeta.low;
    const Icon = meta.icon;

    return (
      <article
        key={item._id}
        style={{
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '14px',
          background: 'rgba(10,15,30,0.48)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: '#f8fafc', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.symptoms || 'Symptom analysis'}
            </p>
            <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
              {item.recommendedSpecialty || 'General Medicine'} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
            </p>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: meta.tone,
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              borderRadius: '999px',
              padding: '4px 9px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            <Icon size={12} /> {risk}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '13px' }} onClick={goToDoctors}>
            <FiUsers /> Find Doctors
          </button>
          <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '13px', color: '#ef4444' }} onClick={() => setDeleteTarget(item)}>
            <FiTrash2 /> Delete History
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="main-content ai-checker-root" style={{ padding: 0, maxWidth: '1240px' }}>
      <section
        className="ai-checker-hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.45fr) minmax(280px,0.55fr)',
          gap: '20px',
          alignItems: 'stretch',
          marginBottom: '22px',
        }}
      >
        <div
          style={{
            border: '1px solid rgba(34,197,94,0.24)',
            borderRadius: '8px',
            padding: '26px',
            background: 'linear-gradient(135deg, rgba(17,24,39,0.96), rgba(30,41,59,0.88))',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#86efac', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', marginBottom: '14px' }}>
            <FiShield /> Patient AI Triage
          </div>
          <h1 style={{ fontSize: '34px', margin: '0 0 8px' }}>AI Symptom Checker</h1>
          <p className="text-muted" style={{ maxWidth: '760px', margin: 0 }}>
            Enter symptoms, review the AI assessment, then continue directly to matching doctors or consultation booking.
          </p>
        </div>

        <div className="card" style={{ borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignContent: 'center' }}>
          <div>
            <p className="text-muted" style={{ fontSize: '12px' }}>Checks</p>
            <strong style={{ fontSize: '26px' }}>{stats.total}</strong>
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '12px' }}>Low</p>
            <strong style={{ fontSize: '26px', color: '#22c55e' }}>{stats.low}</strong>
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '12px' }}>Medium</p>
            <strong style={{ fontSize: '26px', color: '#f59e0b' }}>{stats.medium}</strong>
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '12px' }}>High</p>
            <strong style={{ fontSize: '26px', color: '#ef4444' }}>{stats.high}</strong>
          </div>
        </div>
      </section>

      {(error || success) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '18px',
            color: error ? '#fecaca' : '#bbf7d0',
            background: error ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.28)' : 'rgba(34,197,94,0.28)'}`,
          }}
        >
          {error ? <FiAlertTriangle /> : <FiCheckCircle />}
          <span>{error || success}</span>
        </div>
      )}

      <div className="ai-checker-workspace" style={{ display: 'grid', gridTemplateColumns: 'minmax(360px,0.95fr) minmax(420px,1.05fr)', gap: '22px', alignItems: 'start' }}>
        <section className="card" style={{ borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0 }}>Describe Your Symptoms</h2>
              <p className="text-muted" style={{ marginTop: '4px' }}>More detail helps the AI choose the right specialty.</p>
            </div>
            <FiActivity size={28} color="#22c55e" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="symptoms">Symptoms *</label>
              <textarea
                id="symptoms"
                className="form-textarea"
                name="symptoms"
                placeholder="Example: fever, sore throat, chest tightness, headache, fatigue..."
                value={form.symptoms}
                onChange={updateForm}
                style={{ minHeight: '132px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="age">Age *</label>
                <input id="age" className="form-input" name="age" type="number" min="1" max="120" value={form.age} onChange={updateForm} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender</label>
                <select id="gender" className="form-select" name="gender" value={form.gender} onChange={updateForm}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="duration">Duration</label>
              <input id="duration" className="form-input" name="duration" placeholder="Example: 2 days, 1 week, since last night" value={form.duration} onChange={updateForm} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                className="form-textarea"
                name="notes"
                placeholder="Medicines, allergies, chronic conditions, pregnancy, recent travel..."
                value={form.notes}
                onChange={updateForm}
                style={{ minHeight: '84px', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', minHeight: '46px' }}>
              {loading ? <><span className="spinner" /> Analysing Symptoms</> : <><FiSearch /> Analyse Symptoms</>}
            </button>
          </form>
        </section>

        <section>
          <div
            className="card"
            style={{
              borderRadius: '8px',
              borderColor: result ? currentRiskMeta.border : 'var(--border)',
              boxShadow: result && ['medium', 'high'].includes(resultRisk) ? `0 0 0 1px ${currentRiskMeta.border}` : 'var(--shadow)',
            }}
          >
            {loading ? (
              <div style={{ minHeight: '260px', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <span className="spinner" style={{ display: 'inline-block', marginBottom: '12px' }} />
                  <h3>Analysing symptoms</h3>
                  <p className="text-muted">SmartCareHub AI is preparing your preliminary assessment.</p>
                </div>
              </div>
            ) : result ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div>
                    <p className="form-label" style={{ marginBottom: '5px' }}>Analysis Result</p>
                    <h2 style={{ margin: 0 }}>Recommended next step</h2>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: currentRiskMeta.tone,
                      background: currentRiskMeta.bg,
                      border: `1px solid ${currentRiskMeta.border}`,
                      borderRadius: '999px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    <RiskIcon /> {currentRiskMeta.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(10,15,30,0.58)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                    <p className="form-label">Recommended Specialty</p>
                    <strong style={{ color: '#f8fafc' }}>{result.recommendedSpecialty || 'General Medicine'}</strong>
                  </div>
                  <div style={{ background: 'rgba(10,15,30,0.58)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                    <p className="form-label">Saved To</p>
                    <strong style={{ color: '#f8fafc' }}>Admin AI Logs</strong>
                  </div>
                </div>

                <div style={{ background: 'rgba(10,15,30,0.58)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <p className="form-label">AI Assessment</p>
                  <p className="ai-response" style={{ margin: 0 }}>{result.aiResponse}</p>
                </div>

                {['medium', 'high'].includes(resultRisk) && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: currentRiskMeta.tone, background: currentRiskMeta.bg, border: `1px solid ${currentRiskMeta.border}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                    <FiBell />
                    <span>Notification workflow triggered for this {currentRiskMeta.label.toLowerCase()} result.</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" onClick={goToDoctors}>
                    <FiUsers /> Find Doctors
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleRecommendConsultation} disabled={actionLoading === 'consultation'}>
                    <FiArrowRight /> {actionLoading === 'consultation' ? 'Preparing...' : 'Book Consultation'}
                  </button>
                  {resultRisk === 'high' && (
                    <button type="button" className="btn btn-secondary" onClick={handleEscalate} disabled={actionLoading === 'escalate'} style={{ color: '#fecaca' }}>
                      <FiAlertTriangle /> {actionLoading === 'escalate' ? 'Escalating...' : 'Escalate Case'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ minHeight: '260px', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <div style={{ width: '54px', height: '54px', display: 'grid', placeItems: 'center', margin: '0 auto 14px', borderRadius: '8px', background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                    <FiActivity size={26} />
                  </div>
                  <h3>Ready for analysis</h3>
                  <p className="text-muted" style={{ maxWidth: '420px' }}>
                    Submit your symptoms to see risk level, medical specialty, and matching doctor flow.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Previous Symptom Checks</h2>
                <p className="text-muted" style={{ marginTop: '4px' }}>Saved history from the AI symptom service.</p>
              </div>
              <FiClock color="#94a3b8" />
            </div>

            {historyLoading ? (
              <div style={{ minHeight: '130px', display: 'grid', placeItems: 'center' }}>
                <span className="spinner" />
              </div>
            ) : history.length === 0 ? (
              <div style={{ minHeight: '130px', display: 'grid', placeItems: 'center', textAlign: 'center', color: '#94a3b8' }}>
                <p>No previous symptom checks found.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {history.slice(0, 6).map(renderHistoryItem)}
              </div>
            )}
          </div>
        </section>
      </div>

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: 'min(440px, 100%)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Delete History?</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => setDeleteTarget(null)}>
                <FiX />
              </button>
            </div>
            <p className="text-muted">This removes the selected symptom check from your history and Admin AI Logs.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={actionLoading === deleteTarget._id}>
                <FiTrash2 /> {actionLoading === deleteTarget._id ? 'Deleting...' : 'Delete History'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiSymptomChecker;

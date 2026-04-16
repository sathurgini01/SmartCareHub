import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { checkSymptoms, getSymptomHistory } from '../../api/aiSymptomApi';

function AiSymptomChecker() {
  const { user } = useAuth();
  const [form, setForm] = useState({ symptoms: '', age: '', gender: '', duration: '', notes: '' });
  const [result, setResult]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    // backend requires ?patientId=xxx
    getSymptomHistory(user?.id)
      .then((r) => setHistory(r.data.data || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [user]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.symptoms.trim() || form.symptoms.trim().length < 10) {
      setError('Please describe your symptoms in at least 10 characters.');
      return;
    }
    if (!form.age || form.age < 1 || form.age > 120) {
      setError('Please enter a valid age.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      // backend requires patientId + form data (notes → additionalNotes handled in api layer)
      const res = await checkSymptoms(user?.id, form);
      setResult(res.data.data);
      setHistory((p) => [res.data.data, ...p]);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const riskClass = (r) => {
    const v = (r || '').toLowerCase();
    if (v === 'high')   return 'risk-high';
    if (v === 'medium') return 'risk-medium';
    return 'risk-low';
  };

  return (
    <div className="page">
      <Navbar />
      <div className="main-content">
        <div className="page-hero">
          <div className="page-hero-icon">🧠</div>
          <div className="page-hero-content">
            <h1>AI Symptom Checker</h1>
            <p>Describe your symptoms and receive an AI-powered preliminary health assessment in seconds.</p>
            <div className="page-hero-badge">
              <span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#22c55e',display:'inline-block',boxShadow:'0 0 6px #22c55e'}}/>
              Powered by SmartCareHub AI
            </div>
          </div>
        </div>

        <div className="disclaimer">
          <span>⚠️</span>
          <span>
            <strong>Medical Disclaimer:</strong> This tool provides preliminary guidance only — it is NOT a medical diagnosis.
            Always consult a qualified healthcare professional for medical advice.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Input Form */}
          <div className="card">
            <div className="card-header">
              <div>
                <p className="card-title">Describe Your Symptoms</p>
                <p className="card-sub">Provide as much detail as possible for accurate analysis</p>
              </div>
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Symptoms *</label>
                <textarea
                  className="form-textarea"
                  name="symptoms"
                  placeholder="e.g. I have been experiencing a persistent headache for 3 days, accompanied by mild fever and fatigue..."
                  value={form.symptoms}
                  onChange={handleChange}
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input className="form-input" name="age" type="number" placeholder="e.g. 30" min="1" max="120" value={form.age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <input className="form-input" name="duration" placeholder="e.g. 3 days, 1 week" value={form.duration} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-textarea"
                  name="notes"
                  placeholder="Any medications, allergies, or relevant history..."
                  value={form.notes}
                  onChange={handleChange}
                  style={{ minHeight: '70px' }}
                />
              </div>

              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? <><span className="spinner" /> Analysing symptoms...</> : '🔍 Analyse Symptoms'}
              </button>
            </form>
          </div>

          {/* Result Panel */}
          <div>
            {loading && (
              <div className="card">
                <div className="loading">
                  <span className="spinner" />
                  <span>AI is analysing your symptoms...</span>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="ai-result">
                <div className="ai-result-header">
                  <p className="card-title">Analysis Result</p>
                  <span className={riskClass(result.riskLevel)}>
                    {(result.riskLevel || 'Low').toUpperCase()} RISK
                  </span>
                </div>

                {result.recommendedSpecialty && (
                  <div style={{ marginBottom: '16px' }}>
                    <p className="form-label" style={{ marginBottom: '8px' }}>Recommended Specialty</p>
                    <span className="specialty-tag">{result.recommendedSpecialty}</span>
                    <Link
                      to={`/doctors?specialty=${encodeURIComponent(result.recommendedSpecialty)}`}
                      className="btn btn-outline btn-sm"
                      style={{ marginLeft: '12px' }}
                    >
                      Find Doctors →
                    </Link>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <p className="form-label" style={{ marginBottom: '10px' }}>AI Assessment</p>
                  <p className="ai-response">{result.aiResponse}</p>
                </div>
              </div>
            )}

            {!result && !loading && (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">🩺</div>
                  <p>Fill in your symptoms on the left and click <strong>Analyse Symptoms</strong> to get your AI health assessment.</p>
                </div>
              </div>
            )}

            {/* History */}
            <div className="card" style={{ marginTop: '20px' }}>
              <div className="card-header">
                <p className="card-title">Previous Queries</p>
              </div>
              {historyLoading ? (
                <div className="loading"><span className="spinner" /></div>
              ) : history.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p>No previous queries.</p>
                </div>
              ) : (
                history.slice(0, 5).map((h, i) => (
                  <div key={h._id || i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <p style={{ fontSize: '14px', flex: 1 }}>{h.symptoms?.substring(0, 70)}...</p>
                      <span className={riskClass(h.riskLevel)} style={{ fontSize: '11px', flexShrink: 0 }}>
                        {(h.riskLevel || 'low').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                      {h.recommendedSpecialty && `${h.recommendedSpecialty} · `}
                      {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiSymptomChecker;

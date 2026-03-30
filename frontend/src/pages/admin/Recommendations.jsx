import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { TrendingUp } from 'lucide-react';
import { CALL_TYPES } from '../../utils/constants';

const Recommendations = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [callType, setCallType] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/users')
      .then((res) => setUsers(res.data.data))
      .finally(() => setUsersLoading(false));
  }, []);

  const fetchRecs = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const params = callType ? `?callType=${encodeURIComponent(callType)}` : '';
      const res = await api.get(`/admin/recommendations/${selectedUser}${params}`);
      setRecommendations(res.data);
    } catch {
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const callTypeIcons = { 'Resume Revamp': '📄', 'Job Market Guidance': '🌐', 'Mock Interviews': '🎯' };

  const handleQuickBook = (mentorId) => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    navigate('/dashboard/admin/book', {
      state: {
        prefill: {
          userId: selectedUser,
          mentorId,
          callType,
        },
      },
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mentor Recommendations</h1>
        <p className="page-subtitle">AI-powered mentor matching based on tags, descriptions, and call type</p>
      </div>

      <div className="card animate-in" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Configure Recommendation
          </h3>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select User</label>
            <div className="select-wrapper">
              <select
                id="rec-user-select"
                className="form-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Call Type (Optional)</label>
            <div className="select-wrapper">
              <select
                id="rec-calltype-select"
                className="form-select"
                value={callType}
                onChange={(e) => setCallType(e.target.value)}
              >
                <option value="">General (No Preference)</option>
                {CALL_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{callTypeIcons[ct]} {ct}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {usersLoading && <div className="text-sm text-muted" style={{ marginBottom: 12 }}>Loading users...</div>}

        {selectedUser && (
          <div style={{ marginBottom: 16 }}>
            <p className="text-sm text-muted" style={{ marginBottom: 12 }}>Quick call type selection:</p>
            <div className="call-type-grid">
              {CALL_TYPES.map((ct) => (
                <div
                  key={ct}
                  className={`call-type-pill ${callType === ct ? 'selected' : ''}`}
                  onClick={() => setCallType(callType === ct ? '' : ct)}
                >
                  <div className="call-type-icon">{callTypeIcons[ct]}</div>
                  <div className="call-type-name">{ct}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          id="get-recommendations-btn"
          className="btn btn-primary"
          style={{ maxWidth: 220 }}
          onClick={fetchRecs}
          disabled={!selectedUser || loading}
        >
          {loading ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Loading...</>
          ) : (
            <><TrendingUp size={16} /> Get Recommendations</>
          )}
        </button>
      </div>

      {recommendations && (
        <div className="animate-in">
          <div className="card-header" style={{ marginBottom: 20 }}>
            <div>
              <h3 className="card-title">
                Results for: <span style={{ color: 'var(--primary-light)' }}>{recommendations.user?.name}</span>
              </h3>
              <p className="card-subtitle">
                Call Type: {recommendations.callType} • {recommendations.recommendations?.length} mentors ranked
              </p>
            </div>
          </div>

          {/* Scoring Legend */}
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            <div>
              <strong>📊 Scoring:</strong> Tag Match + Keyword Similarity + Call Type Bonus
              {callType && <span> — <strong>{callType}</strong> preference applied</span>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommendations.recommendations?.map((rec, i) => (
              <div key={rec.mentor.id} className="card" style={{ padding: 20, border: i === 0 ? '1px solid rgba(99,102,241,0.4)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div className="rec-rank" style={{
                    background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                               i === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
                               i === 2 ? 'linear-gradient(135deg, #cd7c3b, #b45309)' :
                               'linear-gradient(135deg, #6366f1, #4f46e5)',
                  }}>
                    #{i + 1}
                  </div>
                  <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 18, background: 'linear-gradient(135deg, #10b981, #059669)', flexShrink: 0 }}>
                    {rec.mentor.name?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{rec.mentor.name}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)' }}>
                          Score: {rec.scores.total}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => handleQuickBook(rec.mentor.id)}
                        >
                          Book This Call
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{rec.mentor.email}</p>

                    {rec.mentor.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {rec.mentor.description}
                      </p>
                    )}

                    <div className="tags-wrap" style={{ marginTop: 10 }}>
                      {rec.mentor.tags?.map((tag, ti) => (
                        <span key={ti} className="tag green">{tag}</span>
                      ))}
                    </div>

                    {/* Score breakdown */}
                    <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                      {[
                        { label: 'Tag Match', val: rec.scores.tagScore },
                        { label: 'Keywords', val: rec.scores.keywordScore },
                        { label: 'Call Bonus', val: rec.scores.callTypeBonus },
                      ].map((s) => (
                        <div key={s.label}>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{s.label}</p>
                          <p style={{ fontSize: 14, fontWeight: 700, color: s.val > 0 ? 'var(--success)' : 'var(--text-muted)' }}>{s.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

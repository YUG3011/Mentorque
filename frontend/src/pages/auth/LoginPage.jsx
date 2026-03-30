import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const LoginPage = ({ role, title, subtitle, loginEndpoint, dashboardPath }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleIcons = { USER: '👤', MENTOR: '🎓', ADMIN: '⚡' };
  const roleColors = { USER: '#0ea5e9', MENTOR: '#10b981', ADMIN: '#f59e0b' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(loginEndpoint, form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back! Logged in as ${role}`);
      navigate(dashboardPath);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Your given password is wrong');
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <span style={{ fontSize: 26 }}>{roleIcons[role]}</span>
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          <div className="auth-role-badge" style={{ borderColor: roleColors[role] + '50', color: roleColors[role] }}>
            {role} Portal
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id={`${role.toLowerCase()}-email`}
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id={`${role.toLowerCase()}-password`}
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
            <button
              id="back-btn"
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
              style={{ marginRight: 8 }}
            >
              Back
            </button>
          </div>

          <button
            id={`${role.toLowerCase()}-login-btn`}
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              background: `linear-gradient(135deg, ${roleColors[role]}, ${roleColors[role]}cc)`,
              boxShadow: `0 4px 16px ${roleColors[role]}33`,
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Signing in...
              </>
            ) : (
              `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`
            )}
          </button>
        </form>

        <div className="divider" />

        <div style={{ textAlign: 'center' }}>
          <p className="text-sm text-muted">
            MentorQue — Smart Mentoring Scheduling
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

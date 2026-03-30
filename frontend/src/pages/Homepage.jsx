import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

const Homepage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const paths = { USER: '/dashboard/user', MENTOR: '/dashboard/mentor', ADMIN: '/dashboard/admin' };
      navigate(paths[user.role] || '/');
    }
  }, [user, navigate]);

  return (
    <div className="auth-page" style={{ flexDirection: 'column', gap: 48 }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        top: '-150px', left: '50%', transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-in" style={{ textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
          borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 24px',
          boxShadow: '0 12px 36px rgba(99,102,241,0.35)',
        }}>
          🎯
        </div>
        <h1 style={{
          fontSize: 48, fontWeight: 900, letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #818cf8 60%, #0ea5e9 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 12,
        }}>
          MentorQue
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Smart mentoring call scheduling with AI-powered recommendations and role-based access control
        </p>
      </div>

      <div className="animate-in" style={{
        display: 'flex', gap: 16, position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { role: 'User', icon: '👤', path: '/login/user', color: '#0ea5e9', desc: 'Find your mentor' },
          { role: 'Mentor', icon: '🎓', path: '/login/mentor', color: '#10b981', desc: 'Share your expertise' },
          { role: 'Admin', icon: '⚡', path: '/login/admin', color: '#f59e0b', desc: 'Manage the platform' },
        ].map((item) => (
          <div
            key={item.role}
            id={`${item.role.toLowerCase()}-portal-btn`}
            onClick={() => navigate(item.path)}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${item.color}25`,
              borderRadius: 'var(--radius-lg)',
              padding: '28px 32px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              width: 180,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 16px 48px ${item.color}20`;
              e.currentTarget.style.borderColor = `${item.color}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = `${item.color}25`;
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{item.role}</p>
            <p style={{ fontSize: 12, color: item.color }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { emoji: '🧠', text: 'AI-powered recommendations' },
          { emoji: '🔐', text: 'Role-based access control' },
          { emoji: '📅', text: 'Smart slot matching' },
          { emoji: '⚡', text: 'Admin-only booking' },
        ].map((feat) => (
          <div key={feat.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{feat.emoji}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{feat.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;

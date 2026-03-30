import { Calendar } from 'lucide-react';

const UserCard = ({ user, onClick, selected }) => {
  return (
    <div
      className={`card ${selected ? 'rec-card selected' : 'rec-card'}`}
      onClick={() => onClick?.(user)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{user.name}</p>
            <span className="badge badge-user">User</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</p>

          {user.description && (
            <p style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 8,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {user.description}
            </p>
          )}

          {user.tags?.length > 0 && (
            <div className="tags-wrap" style={{ marginTop: 10 }}>
              {user.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
              {user.tags.length > 4 && (
                <span className="tag" style={{ opacity: 0.6 }}>+{user.tags.length - 4}</span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <span className="text-sm text-muted">
              <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
              {user._count?.availability || 0} slots
            </span>
            <span className="text-sm text-muted">
              📞 {user._count?.bookings || 0} bookings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;

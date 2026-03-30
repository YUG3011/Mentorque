import { Calendar } from 'lucide-react';

const MentorCard = ({ mentor, onClick, selected, rank }) => {
  return (
    <div
      className={`rec-card ${selected ? 'selected' : ''}`}
      onClick={() => onClick?.(mentor)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {rank !== undefined && (
          <div className="rec-rank" style={{ flexShrink: 0 }}>#{rank + 1}</div>
        )}
        <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0 }}>
          {mentor.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{mentor.mentor?.name || mentor.name}</p>
            <span className="badge badge-mentor">Mentor</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {mentor.mentor?.email || mentor.email}
          </p>

          {(mentor.mentor?.description || mentor.description) && (
            <p style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 8,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {mentor.mentor?.description || mentor.description}
            </p>
          )}

          {(mentor.mentor?.tags || mentor.tags)?.length > 0 && (
            <div className="tags-wrap" style={{ marginTop: 10 }}>
              {(mentor.mentor?.tags || mentor.tags).slice(0, 4).map((tag, i) => (
                <span key={i} className="tag green">{tag}</span>
              ))}
            </div>
          )}

          {mentor.scores && (
            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Match Score</span>
                <div className="score-bar" style={{ marginTop: 4 }}>
                  <div className="score-fill" style={{ width: 80 }}>
                    <div
                      className="score-fill-inner"
                      style={{ width: `${Math.min((mentor.scores.total / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="score-value">{mentor.scores.total}</span>
                </div>
              </div>
              {mentor._count && (
                <span className="text-sm text-muted" style={{ alignSelf: 'flex-end' }}>
                  <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                  {mentor._count?.availability || 0} slots
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorCard;

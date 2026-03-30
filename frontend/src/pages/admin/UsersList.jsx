import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Calendar, Clock } from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then((res) => setUsers(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">All registered users on the platform</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          id="user-search"
          type="text"
          className="form-input"
          placeholder="Search users by name, email, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {loading ? (
        <div className="loader-wrapper"><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">All Users ({filtered.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Tags</th>
                  <th>Description</th>
                  <th>Slots</th>
                  <th>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{user.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="tags-wrap" style={{ maxWidth: 250 }}>
                        {user.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                        {user.tags?.length > 3 && (
                          <span className="tag" style={{ opacity: 0.6 }}>+{user.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.description || '—'}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user._count?.availability}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-light)' }}>{user._count?.bookings}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-title">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersList;

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import TagInput from '../../components/forms/TagInput';
import { Search, Edit2, Save, X, Calendar } from 'lucide-react';

const MentorsList = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ tags: [], description: '' });

  useEffect(() => {
    api.get('/admin/mentors')
      .then((res) => setMentors(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (mentor) => {
    setEditingId(mentor.id);
    setEditForm({ tags: mentor.tags || [], description: mentor.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ tags: [], description: '' });
  };

  const saveEdit = async (mentorId) => {
    try {
      const res = await api.patch(`/admin/mentors/${mentorId}`, editForm);
      setMentors((prev) => prev.map((m) => m.id === mentorId ? { ...m, ...res.data.data } : m));
      toast.success('Mentor updated!');
      cancelEdit();
    } catch {
      toast.error('Failed to update mentor');
    }
  };

  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mentors</h1>
        <p className="page-subtitle">Manage mentor profiles, tags, and descriptions</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          id="mentor-search"
          type="text"
          className="form-input"
          placeholder="Search mentors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {loading ? (
        <div className="loader-wrapper"><div className="spinner" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((mentor) => (
            <div key={mentor.id} className="card animate-in">
              {editingId === mentor.id ? (
                /* Edit Mode */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 18, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        {mentor.name?.[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 16 }}>{mentor.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{mentor.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button id={`save-mentor-${mentor.id}`} className="btn btn-success btn-sm" onClick={() => saveEdit(mentor.id)}>
                        <Save size={14} /> Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <TagInput tags={editForm.tags} onChange={(tags) => setEditForm({ ...editForm, tags })} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input form-textarea"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                      <div className="user-avatar" style={{ width: 44, height: 44, fontSize: 18, background: 'linear-gradient(135deg, #10b981, #059669)', flexShrink: 0 }}>
                        {mentor.name?.[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 16 }}>{mentor.name}</p>
                          <span className="badge badge-mentor">Mentor</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{mentor.email}</p>

                        {mentor.description && (
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
                            {mentor.description}
                          </p>
                        )}

                        <div className="tags-wrap" style={{ marginTop: 10 }}>
                          {mentor.tags?.map((tag, i) => (
                            <span key={i} className="tag green">{tag}</span>
                          ))}
                          {!mentor.tags?.length && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No tags yet</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                          <span className="text-sm text-muted">
                            <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                            {mentor._count?.availability || 0} slots
                          </span>
                          <span className="text-sm text-muted">
                            📞 {mentor._count?.bookings || 0} bookings
                          </span>
                        </div>
                      </div>
                    </div>
                    <button id={`edit-mentor-${mentor.id}`} className="btn btn-secondary btn-sm" onClick={() => startEdit(mentor)}>
                      <Edit2 size={14} /> Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-title">No mentors found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorsList;

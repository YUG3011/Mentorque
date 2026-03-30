import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, Star, Calendar, BookOpen, TrendingUp, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, mentors: 0, bookings: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

  const loadDashboard = async () => {
    const [usersRes, mentorsRes, bookingsRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/mentors'),
      api.get('/admin/bookings'),
    ]);

    setStats({
      users: usersRes.data.count,
      mentors: mentorsRes.data.count,
      bookings: bookingsRes.data.count,
    });
    setBookings(bookingsRes.data.data || []);
  };

  useEffect(() => {
    loadDashboard().finally(() => setLoading(false));
  }, []);

  const statusStyle = (booking) => {
    if (booking.status === 'CANCELED') return { text: 'Canceled', color: '#ef4444' };
    if (booking.mentorRequestStatus === 'PENDING') return { text: 'Pending Mentor Request', color: '#f59e0b' };
    if (booking.mentorRequestStatus === 'REJECTED') return { text: 'Request Rejected', color: '#ef4444' };
    if (booking.mentorRequestStatus === 'APPROVED') return { text: 'Request Approved', color: '#10b981' };
    return { text: 'Confirmed', color: '#10b981' };
  };

  const handleRequestDecision = async (booking, action) => {
    setActionLoadingId(booking.id + action);
    try {
      await api.patch(`/admin/bookings/${booking.id}/request-decision`, { action });
      toast.success('Request processed');
      await loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setActionLoadingId('');
    }
  };

  const callTypeColors = {
    'Resume Revamp': '#6366f1',
    'Job Market Guidance': '#0ea5e9',
    'Mock Interviews': '#10b981',
  };
  const callTypeIcons = {
    'Resume Revamp': '📄',
    'Job Market Guidance': '🌐',
    'Mock Interviews': '🎯',
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Overview</h1>
        <p className="page-subtitle">System-wide view of users, mentors, and scheduled calls</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div>
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Star size={24} /></div>
          <div>
            <div className="stat-value">{stats.mentors}</div>
            <div className="stat-label">Total Mentors</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><BookOpen size={24} /></div>
          <div>
            <div className="stat-value">{stats.bookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><TrendingUp size={24} /></div>
          <div>
            <div className="stat-value">3</div>
            <div className="stat-label">Call Types</div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card animate-in">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Recent Bookings
            </h3>
            <p className="card-subtitle">All scheduled mentoring calls</p>
          </div>
        </div>

        {loading ? (
          <div className="loader-wrapper"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📞</div>
            <p className="empty-state-title">No bookings yet</p>
            <p className="empty-state-desc">Use the Book a Call page to schedule mentoring sessions</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Mentor</th>
                  <th>Call Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                          {b.user?.name?.[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{b.user?.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 12, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                          {b.mentor?.name?.[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{b.mentor?.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.mentor?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: '99px',
                        fontSize: 11,
                        fontWeight: 700,
                        background: callTypeColors[b.callType] + '18',
                        color: callTypeColors[b.callType],
                        border: `1px solid ${callTypeColors[b.callType]}30`,
                      }}>
                        {callTypeIcons[b.callType]} {b.callType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{b.date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        {b.startTime} – {b.endTime}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: 11,
                            fontWeight: 700,
                            color: statusStyle(b).color,
                            border: `1px solid ${statusStyle(b).color}55`,
                            borderRadius: 999,
                            padding: '4px 10px',
                          }}
                        >
                          {statusStyle(b).text}
                        </span>
                        {b.mentorRequestStatus === 'PENDING' && (
                          <p style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                            {b.mentorRequestType}: {b.mentorRequestReason}
                            {b.mentorRequestType === 'RESCHEDULE' && b.proposedDate && (
                              <span> ({b.proposedDate} {b.proposedStartTime}–{b.proposedEndTime})</span>
                            )}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      {b.mentorRequestStatus === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {b.mentorRequestType === 'CANCEL' && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '6px 8px', fontSize: 11 }}
                              disabled={actionLoadingId === b.id + 'APPROVE_CANCEL'}
                              onClick={() => handleRequestDecision(b, 'APPROVE_CANCEL')}
                            >
                              Approve Cancel
                            </button>
                          )}
                          {b.mentorRequestType === 'RESCHEDULE' && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '6px 8px', fontSize: 11 }}
                              disabled={actionLoadingId === b.id + 'APPROVE_RESCHEDULE'}
                              onClick={() => handleRequestDecision(b, 'APPROVE_RESCHEDULE')}
                            >
                              Approve Reschedule
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 8px', fontSize: 11 }}
                            disabled={actionLoadingId === b.id + 'REJECT_REQUEST'}
                            onClick={() => handleRequestDecision(b, 'REJECT_REQUEST')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

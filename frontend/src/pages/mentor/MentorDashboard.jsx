import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import AvailabilityForm from '../../components/forms/AvailabilityForm';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, Star } from 'lucide-react';

const MentorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestForm, setRequestForm] = useState({});
  const [rescheduleOptions, setRescheduleOptions] = useState({});
  const [loadingOptionsId, setLoadingOptionsId] = useState('');
  const [submittingId, setSubmittingId] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/mentor/me'),
      api.get('/mentor/availability'),
      api.get('/mentor/bookings'),
    ]).then(([profileRes, availRes, bookingRes]) => {
      setProfile(profileRes.data.data);
      setSlots(availRes.data.data);
      setBookings(bookingRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleRequestChange = (bookingId, key, value) => {
    setRequestForm((prev) => ({
      ...prev,
      [bookingId]: {
        type: prev[bookingId]?.type || 'CANCEL',
        reason: prev[bookingId]?.reason || '',
        proposedDate: prev[bookingId]?.proposedDate || '',
        proposedStartTime: prev[bookingId]?.proposedStartTime || '',
        proposedEndTime: prev[bookingId]?.proposedEndTime || '',
        selectedSlotId: prev[bookingId]?.selectedSlotId || '',
        [key]: value,
      },
    }));
  };

  const loadRescheduleOptions = async (bookingId) => {
    if (rescheduleOptions[bookingId]) return;
    setLoadingOptionsId(bookingId);
    try {
      const res = await api.get(`/mentor/bookings/${bookingId}/reschedule-options`);
      setRescheduleOptions((prev) => ({ ...prev, [bookingId]: res.data.data || [] }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reschedule options');
      setRescheduleOptions((prev) => ({ ...prev, [bookingId]: [] }));
    } finally {
      setLoadingOptionsId('');
    }
  };

  const submitRequest = async (bookingId) => {
    const form = requestForm[bookingId] || { type: 'CANCEL', reason: '' };
    if (!form.reason?.trim()) {
      toast.error('Please provide a reason for your request');
      return;
    }
    if (form.type === 'RESCHEDULE' && (!form.proposedDate || !form.proposedStartTime || !form.proposedEndTime)) {
      toast.error('Please fill the proposed date and time for reschedule request');
      return;
    }

    setSubmittingId(bookingId);
    try {
      const payload = {
        type: form.type,
        reason: form.reason,
        proposedDate: form.type === 'RESCHEDULE' ? form.proposedDate : undefined,
        proposedStartTime: form.type === 'RESCHEDULE' ? form.proposedStartTime : undefined,
        proposedEndTime: form.type === 'RESCHEDULE' ? form.proposedEndTime : undefined,
      };

      await api.post(`/mentor/bookings/${bookingId}/request-change`, payload);
      const updated = await api.get('/mentor/bookings');
      setBookings(updated.data.data || []);
      toast.success('Request sent to admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingId('');
    }
  };

  const deleteSlot = async (slotId) => {
    try {
      await api.delete(`/mentor/availability/${slotId}`);
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
      toast.success('Slot deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  const getStatusBadge = (booking) => {
    if (booking.status === 'CANCELED') return { text: 'Canceled', color: '#ef4444' };
    if (booking.mentorRequestStatus === 'PENDING') return { text: 'Request Pending', color: '#f59e0b' };
    if (booking.mentorRequestStatus === 'REJECTED') return { text: 'Request Rejected', color: '#ef4444' };
    if (booking.mentorRequestStatus === 'APPROVED') return { text: 'Request Approved', color: '#10b981' };
    return { text: 'Confirmed', color: '#10b981' };
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Mentor Dashboard</h1>
            <p className="page-subtitle">Manage your availability for mentoring sessions</p>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon green"><Star size={22} /></div>
              <div>
                <div className="stat-value">{profile?.tags?.length || 0}</div>
                <div className="stat-label">Expertise Tags</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Calendar size={22} /></div>
              <div>
                <div className="stat-value">{slots.length}</div>
                <div className="stat-label">Available Slots</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple"><Clock size={22} /></div>
              <div>
                <div className="stat-value">{bookings.length}</div>
                <div className="stat-label">Booked Calls</div>
              </div>
            </div>
          </div>
          {/* Bookings card placed under the stat cards per design */}
          <div className="card animate-in" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h3 className="card-title">My Bookings ({bookings.length})</h3>
            </div>

            {bookings.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <div className="empty-state-icon">📞</div>
                <p className="empty-state-title">No booked calls yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bookings.map((booking) => (
                  <div key={booking.id} className="overlap-slot">
                    <div className="slot-dot" style={{ background: 'var(--success)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {booking.date} - {booking.startTime} - {booking.endTime}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            User: {booking.user?.name} — <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{booking.user?.email}</span>
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            ({booking.callType})
                          </p>
                          {booking.cancellationReason && (
                            <p style={{ fontSize: 12, color: '#fca5a5', marginTop: 4 }}>
                              Reason: {booking.cancellationReason}
                            </p>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: getStatusBadge(booking).color,
                            border: `1px solid ${getStatusBadge(booking).color}55`,
                            borderRadius: 999,
                            padding: '4px 10px',
                          }}
                        >
                          {getStatusBadge(booking).text}
                        </span>
                      </div>

                      {booking.status !== 'CANCELED' && booking.mentorRequestStatus !== 'PENDING' && (
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select
                              className="form-select"
                              style={{ maxWidth: 180 }}
                              value={requestForm[booking.id]?.type || 'CANCEL'}
                              onChange={(e) => {
                                const nextType = e.target.value;
                                handleRequestChange(booking.id, 'type', nextType);
                                if (nextType === 'RESCHEDULE') {
                                  loadRescheduleOptions(booking.id);
                                }
                              }}
                            >
                              <option value="CANCEL">Request Cancel</option>
                              <option value="RESCHEDULE">Request Reschedule</option>
                            </select>
                            <input
                              className="form-input"
                              placeholder="Reason for request"
                              value={requestForm[booking.id]?.reason || ''}
                              onChange={(e) => handleRequestChange(booking.id, 'reason', e.target.value)}
                            />
                          </div>

                          {(requestForm[booking.id]?.type || 'CANCEL') === 'RESCHEDULE' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {loadingOptionsId === booking.id ? (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading available overlap slots...</div>
                              ) : (rescheduleOptions[booking.id] || []).length > 0 ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <div style={{ flex: 1 }}>
                                    <label className="form-label">Choose from your availability</label>
                                    <div className="select-wrapper">
                                      <select
                                        className="form-select"
                                        value={requestForm[booking.id]?.selectedSlotId || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          handleRequestChange(booking.id, 'selectedSlotId', val);
                                          if (val) {
                                            const slot = (rescheduleOptions[booking.id] || []).find(
                                              (s) => `${s.date}|${s.startTime}|${s.endTime}` === val
                                            );
                                            if (slot) {
                                              handleRequestChange(booking.id, 'proposedDate', slot.date);
                                              handleRequestChange(booking.id, 'proposedStartTime', slot.startTime);
                                              handleRequestChange(booking.id, 'proposedEndTime', slot.endTime);
                                            }
                                          } else {
                                            handleRequestChange(booking.id, 'proposedDate', '');
                                            handleRequestChange(booking.id, 'proposedStartTime', '');
                                            handleRequestChange(booking.id, 'proposedEndTime', '');
                                          }
                                        }}
                                      >
                                        <option value="">Select a slot...</option>
                                        {(rescheduleOptions[booking.id] || []).map((s, idx) => (
                                          <option key={`${s.date}-${s.startTime}-${s.endTime}-${idx}`} value={`${s.date}|${s.startTime}|${s.endTime}`}>
                                            {s.date} {s.startTime}–{s.endTime}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No saved slots available for reschedule</div>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ maxWidth: 210 }}
                            disabled={submittingId === booking.id}
                            onClick={() => submitRequest(booking.id)}
                          >
                            {submittingId === booking.id ? 'Sending...' : 'Send Request to Admin'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid-2">
            {/* Profile Card */}
            <div className="card animate-in">
              <div className="card-header">
                <h3 className="card-title">My Profile</h3>
              </div>
              {loading ? (
                <div className="loader-wrapper"><div className="spinner" /></div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div className="user-avatar" style={{ width: 56, height: 56, fontSize: 22, background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                      {profile?.name?.[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{profile?.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{profile?.email}</p>
                      <span className="badge badge-mentor" style={{ marginTop: 6 }}>Mentor</span>
                    </div>
                  </div>

                  {profile?.description && (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                      {profile.description}
                    </p>
                  )}

                  {profile?.tags?.length > 0 && (
                    <div>
                      <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Expertise Areas</p>
                      <div className="tags-wrap">
                        {profile.tags.map((tag, i) => (
                          <span key={i} className="tag green">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="alert alert-info" style={{ marginTop: 16 }}>
                    💡 Contact your admin to update your profile tags and description.
                  </div>
                </div>
              )}
            </div>

            {/* Availability Card */}
            <div className="card animate-in">
              <div className="card-header">
                <h3 className="card-title">Add Availability</h3>
              </div>
              <AvailabilityForm role="mentor" onAdded={(slot) => setSlots((prev) => [...prev, slot])} />

              <div className="divider" />

              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                My Slots ({slots.length})
              </h4>

              {slots.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-state-icon">📅</div>
                  <p className="empty-state-title">No slots yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {slots.map((slot) => (
                    <div key={slot.id} className="overlap-slot">
                      <div className="slot-dot" style={{ background: 'var(--success)' }} />
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {slot.date}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {slot.startTime} – {slot.endTime}
                        </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => deleteSlot(slot.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          
        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;

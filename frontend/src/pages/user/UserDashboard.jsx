import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import AvailabilityForm from '../../components/forms/AvailabilityForm';
import TagInput from '../../components/forms/TagInput';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { User, Calendar, Save, Tag, FileText, Clock } from 'lucide-react';

const ProfileSection = ({ user, setUser }) => {
  const [form, setForm] = useState({ tags: user?.tags || [], description: user?.description || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.post('/user/profile', form);
      setUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-in">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <User size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Profile
          </h3>
          <p className="card-subtitle">Update your tags and description to get better mentor recommendations</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <Tag size={13} style={{ display: 'inline', marginRight: 5 }} />
          Your Skills & Interests
        </label>
        <TagInput
          tags={form.tags}
          onChange={(tags) => setForm({ ...form, tags })}
          placeholder="e.g. javascript, python, react (press Enter)"
        />
        <p className="text-sm text-muted" style={{ marginTop: 6 }}>
          Press Enter or comma to add tags. These help match you with the right mentors.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">
          <FileText size={13} style={{ display: 'inline', marginRight: 5 }} />
          Description
        </label>
        <textarea
          className="form-input form-textarea"
          placeholder="Describe your background, goals, and what you're looking for in a mentor..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
        />
      </div>

      <button id="save-profile-btn" className="btn btn-primary" style={{ maxWidth: 200 }} onClick={handleSave} disabled={loading}>
        <Save size={16} />
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
};

const AvailabilitySection = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/availability')
      .then((res) => setSlots(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card animate-in">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <Calendar size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            My Availability
          </h3>
          <p className="card-subtitle">Add time slots when you're available for mentoring calls</p>
        </div>
      </div>

      <AvailabilityForm role="user" onAdded={(slot) => setSlots((prev) => [...prev, slot])} />

      <div className="divider" />

      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Scheduled Slots ({slots.length})
      </h4>

      {loading ? (
        <div className="loader-wrapper"><div className="spinner" /></div>
      ) : slots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-title">No availability added yet</p>
          <p className="empty-state-desc">Add your first time slot above</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slots.map((slot) => (
            <div key={slot.id} className="overlap-slot">
              <div className="slot-dot" />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                  {slot.startTime} – {slot.endTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [slotsCount, setSlotsCount] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState('');

  const refreshBookings = async () => {
    try {
      const bookingsRes = await api.get('/user/bookings');
      setBookings(bookingsRes.data.data || []);
    } catch {
      // keep silent to avoid noisy toasts during background polling
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/user/me'),
      api.get('/user/availability'),
      api.get('/user/bookings'),
    ])
      .then(([userRes, availabilityRes, bookingsRes]) => {
        setUserData(userRes.data.data);
        setSlotsCount((availabilityRes.data.data || []).length);
        setBookings(bookingsRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshBookings();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const cancelBooking = async (bookingId) => {
    const reason = window.prompt('Reason for canceling this call (optional)') || '';
    setCancelingId(bookingId);
    try {
      await api.patch(`/user/bookings/${bookingId}/cancel`, { reason });
      const refreshed = await api.get('/user/bookings');
      setBookings(refreshed.data.data || []);
      toast.success('Booking canceled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelingId('');
    }
  };

  const bookingStatus = (booking) => {
    if (booking.status === 'CANCELED') return { text: 'Canceled', color: '#ef4444' };
    return { text: 'Confirmed', color: '#10b981' };
  };

  const bookingUpdatedBadge = (booking) => {
    // Show a small badge when the booking was changed via a mentor reschedule approval
    if (booking.mentorRequestStatus === 'APPROVED' && booking.status !== 'CANCELED') {
      return { text: 'Rescheduled', color: '#f59e0b' };
    }
    return null;
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="page-header">
                    <h1 className="page-title">My Dashboard</h1>
                    <p className="page-subtitle">Manage your profile and availability</p>
                  </div>

                  <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                    <div className="stat-card">
                      <div className="stat-icon blue"><User size={22} /></div>
                      <div>
                        <div className="stat-value">{userData?.tags?.length || 0}</div>
                        <div className="stat-label">Skills Tagged</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon green"><Calendar size={22} /></div>
                      <div>
                        <div className="stat-value">{slotsCount}</div>
                        <div className="stat-label">Available Slots</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon purple"><Clock size={22} /></div>
                      <div>
                        <div className="stat-value">{bookings.length}</div>
                        <div className="stat-label">Calls Booked</div>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="loader-wrapper"><div className="spinner" /></div>
                  ) : (
                    <>
                      {/* Bookings card placed right under the stat cards per design */}
                      <div className="card animate-in" style={{ marginBottom: 20 }}>
                        <div className="card-header">
                          <h3 className="card-title">My Bookings ({bookings.length})</h3>
                        </div>

                        {bookings.length === 0 ? (
                          <div className="empty-state" style={{ padding: 20 }}>
                            <div className="empty-state-icon">📞</div>
                            <p className="empty-state-title">No calls booked yet</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {bookings.map((booking) => (
                              <div key={booking.id} className="overlap-slot">
                                <div className="slot-dot" />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                                    <div>
                                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {booking.date} - {booking.startTime} - {booking.endTime}
                                        {bookingUpdatedBadge(booking) && (
                                          <span
                                            style={{
                                              marginLeft: 8,
                                              fontSize: 11,
                                              fontWeight: 700,
                                              color: bookingUpdatedBadge(booking).color,
                                              border: `1px solid ${bookingUpdatedBadge(booking).color}33`,
                                              borderRadius: 999,
                                              padding: '2px 8px',
                                            }}
                                          >
                                            {bookingUpdatedBadge(booking).text}
                                          </span>
                                        )}
                                      </p>
                                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                        Mentor: {booking.mentor?.name} — <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{booking.mentor?.email}</span>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 700,
                                          color: bookingStatus(booking).color,
                                          border: `1px solid ${bookingStatus(booking).color}55`,
                                          borderRadius: 999,
                                          padding: '4px 10px',
                                        }}
                                      >
                                        {bookingStatus(booking).text}
                                      </span>
                                      {booking.status !== 'CANCELED' && (
                                        <button
                                          type="button"
                                          className="btn btn-secondary"
                                          style={{ padding: '6px 10px', fontSize: 12 }}
                                          disabled={cancelingId === booking.id}
                                          onClick={() => cancelBooking(booking.id)}
                                        >
                                          {cancelingId === booking.id ? 'Canceling...' : 'Cancel'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <ProfileSection user={userData} setUser={setUserData} />
                    </>
                  )}
                </>
              }
            />
            <Route path="/availability" element={<AvailabilitySection />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;

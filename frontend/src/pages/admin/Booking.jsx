import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, CheckCircle, BookOpen, AlertCircle } from 'lucide-react';
import { CALL_TYPES } from '../../utils/constants';

const Booking = () => {
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedMentor, setSelectedMentor] = useState('');
  const [callType, setCallType] = useState('');
  const [overlaps, setOverlaps] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState({ init: true, overlaps: false, booking: false });
  const [booked, setBooked] = useState(null);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    Promise.all([api.get('/admin/users'), api.get('/admin/mentors')])
      .then(([uRes, mRes]) => { setUsers(uRes.data.data); setMentors(mRes.data.data); })
      .finally(() => setLoading((l) => ({ ...l, init: false })));
  }, []);

  useEffect(() => {
    if (loading.init || prefillApplied) return;
    const prefill = location.state?.prefill;
    if (!prefill) return;

    if (prefill.userId) setSelectedUser(prefill.userId);
    if (prefill.mentorId) setSelectedMentor(prefill.mentorId);
    if (prefill.callType) setCallType(prefill.callType);
    setPrefillApplied(true);
    toast.success('Booking form pre-filled from recommendation');
  }, [loading.init, prefillApplied, location.state]);

  const checkOverlap = async () => {
    if (!selectedUser || !selectedMentor) {
      toast.error('Select both a user and mentor first');
      return;
    }
    setLoading((l) => ({ ...l, overlaps: true }));
    setSelectedSlot(null);
    try {
      const res = await api.get(`/admin/availability-overlap?userId=${selectedUser}&mentorId=${selectedMentor}`);
      setOverlaps(res.data.overlaps || []);
      if (res.data.overlaps?.length === 0) {
        toast.error('No overlapping availability found between this user and mentor');
      } else {
        const availableCount = res.data.availableCount ?? 0;
        const bookedCount = res.data.bookedCount ?? 0;
        if (availableCount === 0 && bookedCount > 0) {
          toast.error('All overlapping slots are already booked. Choose another user/mentor or time.');
        } else {
          toast.success(`Found ${availableCount} available slot(s) and ${bookedCount} booked slot(s).`);
        }
      }
    } catch {
      toast.error('Failed to check overlaps');
    } finally {
      setLoading((l) => ({ ...l, overlaps: false }));
    }
  };

  const handleBook = async () => {
    if (!selectedSlot || !callType) {
      toast.error('Select a time slot and call type');
      return;
    }

    if (selectedSlot.isBooked) {
      toast.error('This slot is already booked. Please select another slot.');
      return;
    }

    setLoading((l) => ({ ...l, booking: true }));
    try {
      const res = await api.post('/admin/book', {
        userId: selectedUser,
        mentorId: selectedMentor,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        callType,
      });
      setBooked(res.data.data);
      toast.success('🎉 Call booked successfully!');
      setOverlaps([]);
      setSelectedSlot(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading((l) => ({ ...l, booking: false }));
    }
  };

  const callTypeIcons = { 'Resume Revamp': '📄', 'Job Market Guidance': '🌐', 'Mock Interviews': '🎯' };
  const availableSlots = overlaps.filter((slot) => !slot.isBooked);
  const bookedSlots = overlaps.filter((slot) => slot.isBooked);

  if (loading.init) return <div className="loader-wrapper"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Book a Call</h1>
        <p className="page-subtitle">Schedule a mentoring session between a user and mentor</p>
      </div>

      {booked && (
        <div className="alert alert-success animate-in" style={{ marginBottom: 24, fontSize: 15 }}>
          <CheckCircle size={18} />
          <div>
            <strong>Booking Confirmed!</strong> {booked.user?.name} × {booked.mentor?.name} on {booked.date} at {booked.startTime}–{booked.endTime}
            <span style={{ display: 'block', fontSize: 13, marginTop: 2, opacity: 0.8 }}>Call Type: {booked.callType}</span>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Step 1: Select User + Mentor */}
          <div className="card animate-in">
            <h3 className="card-title" style={{ marginBottom: 16 }}>
              <span style={{ color: 'var(--primary-light)' }}>Step 1:</span> Select Participants
            </h3>

            <div className="form-group">
              <label className="form-label">User</label>
              <div className="select-wrapper">
                <select
                  id="book-user-select"
                  className="form-select"
                  value={selectedUser}
                  onChange={(e) => { setSelectedUser(e.target.value); setOverlaps([]); setSelectedSlot(null); }}
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mentor</label>
              <div className="select-wrapper">
                <select
                  id="book-mentor-select"
                  className="form-select"
                  value={selectedMentor}
                  onChange={(e) => { setSelectedMentor(e.target.value); setOverlaps([]); setSelectedSlot(null); }}
                >
                  <option value="">Choose a mentor...</option>
                  {mentors.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.email}</option>)}
                </select>
              </div>
            </div>

            <button
              id="check-overlap-btn"
              className="btn btn-secondary"
              onClick={checkOverlap}
              disabled={!selectedUser || !selectedMentor || loading.overlaps}
              style={{ width: '100%' }}
            >
              {loading.overlaps ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Checking...</>
              ) : (
                <><Calendar size={16} /> Check Overlapping Availability</>
              )}
            </button>
          </div>

          {/* Step 2: Call Type */}
          <div className="card animate-in">
            <h3 className="card-title" style={{ marginBottom: 16 }}>
              <span style={{ color: 'var(--primary-light)' }}>Step 2:</span> Select Call Type
            </h3>
            <div className="call-type-grid">
              {CALL_TYPES.map((ct) => (
                <div
                  key={ct}
                  id={`calltype-${ct.replace(/\s+/g, '-').toLowerCase()}`}
                  className={`call-type-pill ${callType === ct ? 'selected' : ''}`}
                  onClick={() => setCallType(ct)}
                >
                  <div className="call-type-icon">{callTypeIcons[ct]}</div>
                  <div className="call-type-name">{ct}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Overlapping Slots */}
        <div className="card animate-in">
          <h3 className="card-title" style={{ marginBottom: 4 }}>
            <span style={{ color: 'var(--primary-light)' }}>Step 3:</span> Select Time Slot
          </h3>
          <p className="card-subtitle" style={{ marginBottom: 20 }}>
            Slots where both user and mentor are available
          </p>

          {overlaps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-title">No overlaps yet</p>
              <p className="empty-state-desc">Select a user & mentor and click "Check Overlapping Availability"</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <span className="tag green" style={{ marginRight: 8 }}>
                  {availableSlots.length} available
                </span>
                <span className="tag" style={{ borderColor: 'rgba(239, 68, 68, 0.35)', color: '#fca5a5' }}>
                  {bookedSlots.length} booked
                </span>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                {overlaps.map((slot, i) => (
                  <div
                    key={i}
                    id={`slot-${i}`}
                    className={`overlap-slot ${slot.isBooked ? 'booked' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => {
                      if (slot.isBooked) return;
                      setSelectedSlot(selectedSlot === slot ? null : slot);
                    }}
                  >
                    <div className="slot-dot" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{slot.date}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                        {slot.startTime} – {slot.endTime}
                      </p>
                      {slot.isBooked && (
                        <p style={{ fontSize: 12, color: '#fca5a5', marginTop: 4 }}>
                          Already booked
                        </p>
                      )}
                    </div>
                    {selectedSlot === slot && !slot.isBooked && (
                      <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="divider" />

          {/* Summary */}
          {selectedSlot && callType && (
            <div style={{ marginBottom: 16, padding: '14px', background: 'rgba(99,102,241,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Booking Summary</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ fontSize: 13 }}>📅 <strong style={{ color: 'var(--text-primary)' }}>{selectedSlot.date}</strong></p>
                <p style={{ fontSize: 13 }}>⏰ <strong style={{ color: 'var(--text-primary)' }}>{selectedSlot.startTime} – {selectedSlot.endTime}</strong></p>
                <p style={{ fontSize: 13 }}>{callTypeIcons[callType]} <strong style={{ color: 'var(--text-primary)' }}>{callType}</strong></p>
              </div>
            </div>
          )}

          <button
            id="confirm-booking-btn"
            className="btn btn-success"
            onClick={handleBook}
            disabled={!selectedSlot || !callType || loading.booking}
            style={{ width: '100%' }}
          >
            {loading.booking ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Booking...</>
            ) : (
              <><BookOpen size={16} /> Confirm Booking</>
            )}
          </button>

          {(!selectedSlot || !callType) && overlaps.length > 0 && (
            <div className="alert alert-info" style={{ marginTop: 12 }}>
              <AlertCircle size={14} />
              {!selectedSlot ? 'Select a time slot above' : 'Select a call type'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;

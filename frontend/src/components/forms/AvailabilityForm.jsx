import { useState } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AvailabilityForm = ({ role = 'user', onAdded }) => {
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime || !form.endTime) {
      toast.error('Please fill all fields');
      return;
    }
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const endpoint = role === 'mentor' ? '/mentor/availability' : '/user/availability';
      const res = await api.post(endpoint, form);
      toast.success('Availability slot added!');
      setForm({ date: '', startTime: '', endTime: '' });
      onAdded?.(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <Calendar size={13} style={{ display: 'inline', marginRight: 5 }} />
            Date
          </label>
          <input
            type="date"
            className="form-input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <Clock size={13} style={{ display: 'inline', marginRight: 5 }} />
            Start Time
          </label>
          <input
            type="time"
            className="form-input"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <Clock size={13} style={{ display: 'inline', marginRight: 5 }} />
            End Time
          </label>
          <input
            type="time"
            className="form-input"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-success btn-sm" disabled={loading}>
        <Plus size={16} />
        {loading ? 'Adding...' : 'Add Slot'}
      </button>
    </form>
  );
};

export default AvailabilityForm;

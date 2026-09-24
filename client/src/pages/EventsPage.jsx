import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Check } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const categoryColors = {
  academic: 'badge-blue', cultural: 'badge-cyan', sports: 'badge-green',
  technical: 'badge-indigo', club: 'badge-violet', placement: 'badge-yellow', other: 'badge-gray',
};

const EventsPage = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'academic', startDate: '', endDate: '', venue: '',
  });

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events?limit=30');
      setEvents(res.data.events);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const rsvp = async (eventId, currentRSVP) => {
    try {
      const res = await api.post(`/events/${eventId}/rsvp`);
      toast.success(res.data.hasRSVPed ? 'RSVP confirmed!' : 'RSVP removed');
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId ? { ...e, hasRSVPed: res.data.hasRSVPed, rsvpCount: res.data.rsvpCount } : e
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/events', form);
      toast.success('Event created!');
      setCreateOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating event');
    }
    setSubmitting(false);
  };

  const formatDateRange = (start, end) => {
    const s = new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!end) return s;
    const e = new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return s === e ? s : `${s} – ${e}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Events & Clubs</h1>
        {user?.role !== 'student' && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <motion.div
            key={ev._id}
            className="glass-card overflow-hidden group"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
          >
            {/* Header strip */}
            <div className="h-2 w-full" style={{
              background: ev.category === 'academic' ? 'linear-gradient(90deg,#6366F1,#4F46E5)' :
                ev.category === 'cultural' ? 'linear-gradient(90deg,#22D3EE,#06B6D4)' :
                ev.category === 'sports' ? 'linear-gradient(90deg,#10B981,#059669)' :
                ev.category === 'technical' ? 'linear-gradient(90deg,#8B5CF6,#6D28D9)' :
                'linear-gradient(90deg,#F59E0B,#D97706)',
            }} />
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate">{ev.title}</h3>
                  <span className={`badge mt-1 ${categoryColors[ev.category] || 'badge-gray'}`}>{ev.category}</span>
                </div>
                <span className={`badge flex-shrink-0 ${ev.status === 'upcoming' ? 'badge-blue' : ev.status === 'ongoing' ? 'badge-green' : 'badge-gray'}`}>
                  {ev.status}
                </span>
              </div>
              {ev.description && <p className="text-xs text-slate-400 line-clamp-2">{ev.description}</p>}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" /> {formatDateRange(ev.startDate, ev.endDate)}
                </div>
                {ev.venue && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {ev.venue}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" /> {ev.rsvpCount ?? ev.rsvpList?.length ?? 0} RSVPs
                </div>
              </div>
              {user?.role === 'student' && (
                <button
                  onClick={() => rsvp(ev._id, ev.hasRSVPed)}
                  className={`w-full flex items-center justify-center gap-2 text-sm py-2 rounded-lg transition-all ${
                    ev.hasRSVPed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      : 'btn-secondary'
                  }`}
                >
                  {ev.hasRSVPed ? <><Check className="w-4 h-4" /> Going</> : 'RSVP'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {events.length === 0 && (
          <div className="glass-card p-12 text-center col-span-3">
            <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No events yet</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Event" size="md">
        <form onSubmit={createEvent} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field resize-none min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['academic','cultural','sports','technical','club','placement','other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Venue</label>
              <input className="input-field" placeholder="Auditorium" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="datetime-local" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="datetime-local" className="input-field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsPage;

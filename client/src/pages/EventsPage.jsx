import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Check, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

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
      setEvents(res.data.events || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const rsvp = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/rsvp`);
      toast.success(res.data.hasRSVPed ? 'RSVP registered successfully!' : 'RSVP cancelled');
      setEvents((prev) =>
        prev.map((e) =>
          e._id === eventId ? { ...e, hasRSVPed: res.data.hasRSVPed, rsvpCount: res.data.rsvpCount } : e
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing RSVP');
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/events', form);
      toast.success('Campus event created & email notifications dispatched!');
      setCreateOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating event');
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
            <span>Campus Activities</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Events & Clubs</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover annual hackathons, technical workshops, guest lectures, and cultural club meetups.
          </p>
        </div>
        {user?.role !== 'student' && (
          <button onClick={() => setCreateOpen(true)} className="btn-pill-primary text-xs">
            <Plus className="w-4 h-4" />
            <span>Create Campus Event</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
          <motion.div
            key={ev._id}
            className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 flex flex-col justify-between"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="badge-chip capitalize text-[10px]">{ev.category}</span>
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {ev.rsvpCount || 0} attending
                </span>
              </div>
              <h3 className="font-bold text-base text-[#111827] dark:text-white line-clamp-1">{ev.title}</h3>
              {ev.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{ev.description}</p>}
            </div>

            <div className="mt-5 pt-4 border-t border-[#e2e5f0] dark:border-[#22242a] flex items-center justify-between">
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(ev.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{ev.venue || 'Campus Auditorium'}</span>
                </div>
              </div>

              <button
                onClick={() => rsvp(ev._id)}
                className={`text-xs py-2 px-4 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                  ev.hasRSVPed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                    : 'btn-pill-primary'
                }`}
              >
                {ev.hasRSVPed ? <><Check className="w-3.5 h-3.5" /> Registered</> : 'RSVP Now'}
              </button>
            </div>
          </motion.div>
        ))}
        {events.length === 0 && (
          <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-12 text-center col-span-3">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#111827] dark:text-white">No active events posted</p>
            <p className="text-xs text-slate-500 mt-1">Campus clubs and event coordinators will post upcoming drives here.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Campus Event" size="md">
        <form onSubmit={createEvent} className="space-y-4 text-left">
          <div>
            <label className="label">Event Title</label>
            <input className="input-field" placeholder="Annual 36-Hour Hackathon 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description & Agenda</label>
            <textarea className="input-field min-h-[70px] resize-none" placeholder="Details, eligibility criteria, prize pool..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {['academic', 'technical', 'cultural', 'sports', 'club', 'placement', 'other'].map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Venue</label>
              <input className="input-field" placeholder="Seminar Hall A" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input type="datetime-local" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="datetime-local" className="input-field" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-pill-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-pill-primary flex-1" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Event & Notify ↗'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsPage;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Calendar, MapPin, Building, Send, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
const daysUntil = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));

const PlacementsPage = () => {
  const { user } = useAuthStore();
  const [placements, setPlacements] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [tab, setTab] = useState('listings');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company: '', role: '', type: 'full_time', description: '', ctc: '',
    location: '', lastDateToApply: '', 'eligibilityCriteria.minCGPA': '',
  });
  const [coverLetter, setCoverLetter] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/placements?limit=30');
      setPlacements(res.data.placements);
      if (user?.role === 'student') {
        const appRes = await api.get('/placements/my-applications');
        setMyApps(appRes.data.applications);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const apply = async () => {
    setSubmitting(true);
    try {
      await api.post(`/placements/${applyOpen._id}/apply`, { coverLetter });
      toast.success('Applied successfully!');
      setApplyOpen(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    }
    setSubmitting(false);
  };

  const createPlacement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = { ...form };
      if (form['eligibilityCriteria.minCGPA']) {
        body.eligibilityCriteria = { minCGPA: Number(form['eligibilityCriteria.minCGPA']) };
        delete body['eligibilityCriteria.minCGPA'];
      }
      await api.post('/placements', body);
      toast.success('Placement posted!');
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
    setSubmitting(false);
  };

  const statusColor = {
    applied: 'badge-blue', shortlisted: 'badge-yellow', interviewed: 'badge-cyan',
    selected: 'badge-green', rejected: 'badge-red',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Placements</h1>
        {user?.role !== 'student' && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Post Placement
          </button>
        )}
      </div>

      {user?.role === 'student' && (
        <div className="flex gap-1 p-1 glass-card w-fit rounded-lg">
          {['listings', 'my applications'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >{t}</button>
          ))}
        </div>
      )}

      {/* Listings */}
      {(user?.role !== 'student' || tab === 'listings') && (
        <div className="grid sm:grid-cols-2 gap-4">
          {placements.map((p) => (
            <motion.div key={p._id} className="glass-card p-5 space-y-3 group" whileHover={{ y: -2 }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{p.company}</h3>
                  <p className="text-sm text-slate-300">{p.role}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge ${p.status === 'open' ? 'badge-green' : p.status === 'upcoming' ? 'badge-blue' : 'badge-gray'}`}>
                    {p.status}
                  </span>
                  <span className="badge badge-gray capitalize">{p.type.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                {p.ctc && <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {p.ctc}</span>}
                {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</span>}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {daysUntil(p.lastDateToApply) === 0 ? '⚠ Closes today' : `${daysUntil(p.lastDateToApply)}d left`}
                </span>
                {p.eligibilityCriteria?.minCGPA && (
                  <span>Min CGPA: {p.eligibilityCriteria.minCGPA}</span>
                )}
              </div>
              {user?.role === 'student' && (
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  {p.myApplication ? (
                    <span className={`badge ${statusColor[p.myApplication.status] || 'badge-gray'}`}>
                      {p.myApplication.status}
                    </span>
                  ) : p.status === 'open' ? (
                    <button
                      onClick={() => setApplyOpen(p)}
                      className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Apply
                    </button>
                  ) : <span className="text-xs text-slate-500">Closed</span>}
                </div>
              )}
            </motion.div>
          ))}
          {placements.length === 0 && (
            <div className="glass-card p-12 text-center col-span-2">
              <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No placement postings yet</p>
            </div>
          )}
        </div>
      )}

      {/* My Applications */}
      {user?.role === 'student' && tab === 'my applications' && (
        <div className="space-y-3">
          {myApps.map((app) => (
            <div key={app._id} className="glass-card p-5 flex items-center gap-4">
              <Briefcase className="w-8 h-8 text-indigo-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{app.placement?.company}</p>
                <p className="text-sm text-slate-400">{app.placement?.role}</p>
                <p className="text-xs text-slate-500 mt-0.5">Applied {formatDate(app.appliedAt)}</p>
              </div>
              <span className={`badge ${statusColor[app.status] || 'badge-gray'}`}>{app.status}</span>
            </div>
          ))}
          {myApps.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-400">No applications yet</p>
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      <Modal isOpen={!!applyOpen} onClose={() => setApplyOpen(null)} title={`Apply: ${applyOpen?.company} — ${applyOpen?.role}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Cover Letter (optional)</label>
            <textarea className="input-field resize-none min-h-[120px]" placeholder="Why are you a good fit?" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
          </div>
          <p className="text-xs text-slate-400">Resume upload coming soon. Application tracked immediately.</p>
          <div className="flex gap-3">
            <button onClick={() => setApplyOpen(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={apply} className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Applying...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Post Placement" size="lg">
        <form onSubmit={createPlacement} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company</label>
              <input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            </div>
            <div>
              <label className="label">Role</label>
              <input className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['full_time','internship','part_time','contract'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label">CTC</label>
              <input className="input-field" placeholder="8-12 LPA" value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="label">Last Date to Apply</label>
              <input type="date" className="input-field" value={form.lastDateToApply} onChange={(e) => setForm({ ...form, lastDateToApply: e.target.value })} required />
            </div>
            <div>
              <label className="label">Min CGPA</label>
              <input type="number" step="0.1" min="0" max="10" className="input-field" value={form['eligibilityCriteria.minCGPA']} onChange={(e) => setForm({ ...form, 'eligibilityCriteria.minCGPA': e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field resize-none min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Placement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlacementsPage;

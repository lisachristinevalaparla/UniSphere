import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Calendar, MapPin, Building, Send, ChevronRight, Check, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
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
    location: '', lastDateToApply: '', minCGPA: '',
  });
  const [coverLetter, setCoverLetter] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/placements?limit=30');
      setPlacements(res.data.placements || []);
      if (user?.role === 'student') {
        const appRes = await api.get('/placements/my-applications');
        setMyApps(appRes.data.applications || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const apply = async () => {
    setSubmitting(true);
    try {
      await api.post(`/placements/${applyOpen._id}/apply`, { coverLetter });
      toast.success('Application submitted successfully!');
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
      const payload = {
        company: form.company,
        role: form.role,
        type: form.type,
        description: form.description,
        ctc: form.ctc,
        location: form.location,
        lastDateToApply: form.lastDateToApply,
        eligibilityCriteria: {
          minCGPA: form.minCGPA ? parseFloat(form.minCGPA) : undefined,
        },
      };
      await api.post('/placements', payload);
      toast.success('Placement drive published & email alerts dispatched!');
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating placement drive');
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
            <span>Career Opportunities</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Placements & Internships</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore campus recruitment drives, submit applications, and track interview progress.
          </p>
        </div>
        {user?.role !== 'student' && (
          <button onClick={() => setCreateOpen(true)} className="btn-pill-primary text-xs">
            <Plus className="w-4 h-4" />
            <span>Post Placement Drive</span>
          </button>
        )}
      </div>

      {/* Segmented Tabs */}
      {user?.role === 'student' && (
        <div className="inline-block">
          <div className="segmented-pill-container">
            <button
              onClick={() => setTab('listings')}
              className={`segmented-pill-item ${tab === 'listings' ? 'segmented-pill-item-active' : ''}`}
            >
              Open Drives ({placements.length})
            </button>
            <button
              onClick={() => setTab('applications')}
              className={`segmented-pill-item ${tab === 'applications' ? 'segmented-pill-item-active' : ''}`}
            >
              My Applications ({myApps.length})
            </button>
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {tab === 'listings' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placements.map((p) => {
            const hasApplied = myApps.some((a) => a.placement?._id === p._id || a.placement === p._id);
            const remaining = daysUntil(p.lastDateToApply);
            return (
              <motion.div
                key={p._id}
                className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 flex flex-col justify-between"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="badge-chip capitalize text-[10px]">{p.type?.replace('_', ' ') || 'Full Time'}</span>
                    {p.ctc && <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{p.ctc}</span>}
                  </div>
                  <h3 className="font-bold text-base text-[#111827] dark:text-white line-clamp-1">{p.role}</h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{p.company}</p>
                  {p.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{p.description}</p>}
                </div>

                <div className="mt-5 pt-4 border-t border-[#e2e5f0] dark:border-[#22242a] space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.location || 'On-Campus / Remote'}</span>
                    <span>Min CGPA: {p.eligibilityCriteria?.minCGPA || 'None'}</span>
                  </div>

                  {user?.role === 'student' && (
                    hasApplied ? (
                      <div className="w-full py-2.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-center flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/40">
                        <Check className="w-3.5 h-3.5" /> Applied
                      </div>
                    ) : (
                      <button
                        onClick={() => setApplyOpen(p)}
                        className="btn-pill-primary w-full text-xs py-2.5"
                      >
                        <span>Apply for Role</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            );
          })}
          {placements.length === 0 && (
            <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-12 text-center col-span-3">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#111827] dark:text-white">No active placement drives currently open</p>
              <p className="text-xs text-slate-500 mt-1">The placement cell will announce upcoming company visits soon.</p>
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {tab === 'applications' && (
        <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
            <h2 className="text-sm font-bold text-[#111827] dark:text-white">Submitted Placement Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f9fd] dark:bg-[#141518] text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  {['Company', 'Role', 'Applied Date', 'Application Status'].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e5f0] dark:divide-[#22242a] text-xs">
                {myApps.map((a) => (
                  <tr key={a._id} className="hover:bg-[#f8f9fd] dark:hover:bg-[#1e2026] transition-colors">
                    <td className="px-6 py-3.5 font-bold text-[#111827] dark:text-white">{a.placement?.company || 'Company'}</td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">{a.placement?.role || 'Role'}</td>
                    <td className="px-6 py-3.5 text-slate-500">{new Date(a.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-6 py-3.5">
                      <span className={`badge-chip capitalize ${
                        a.status === 'selected' ? 'bg-emerald-100 text-emerald-800' :
                        a.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-800' :
                        a.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {a.status || 'Submitted'}
                      </span>
                    </td>
                  </tr>
                ))}
                {myApps.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-slate-400 py-10">No applications submitted yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      <Modal isOpen={!!applyOpen} onClose={() => setApplyOpen(null)} title={`Apply: ${applyOpen?.role} at ${applyOpen?.company}`}>
        <div className="space-y-4 text-left">
          <div>
            <label className="label">Cover Letter / Portfolio Summary</label>
            <textarea
              className="input-field min-h-[120px] resize-none text-xs"
              placeholder="Briefly describe your key technical skills, projects, and CGPA..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500">Your registered university resume and profile details will be submitted.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setApplyOpen(null)} className="btn-pill-secondary flex-1">Cancel</button>
            <button onClick={apply} className="btn-pill-primary flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm Application ↗'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Post Placement Drive" size="md">
        <form onSubmit={createPlacement} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company Name</label>
              <input className="input-field" placeholder="Google" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            </div>
            <div>
              <label className="label">Job Role</label>
              <input className="input-field" placeholder="Software Engineer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Role Description</label>
            <textarea className="input-field min-h-[70px] resize-none" placeholder="Job description, tech stack, responsibilities..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Package / CTC</label>
              <input className="input-field" placeholder="18 - 24 LPA" value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" placeholder="Bengaluru / Hybrid" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Last Date To Apply</label>
              <input type="date" className="input-field" value={form.lastDateToApply} onChange={(e) => setForm({ ...form, lastDateToApply: e.target.value })} required />
            </div>
            <div>
              <label className="label">Minimum CGPA Cutoff</label>
              <input type="number" step="0.1" className="input-field" placeholder="7.5" value={form.minCGPA} onChange={(e) => setForm({ ...form, minCGPA: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-pill-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-pill-primary flex-1" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish & Notify Students ↗'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlacementsPage;

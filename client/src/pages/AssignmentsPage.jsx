import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, Upload, Calendar, Check, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
const daysUntil = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));
const isPast = (d) => new Date(d) < new Date();

const AssignmentsPage = () => {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', subject: '', subjectCode: '', dueDate: '', totalMarks: 100 });
  const [submitText, setSubmitText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/assignments?limit=30');
      setAssignments(res.data.assignments || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const createAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/assignments', form);
      toast.success('Assignment created & email notifications dispatched!');
      setCreateOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating assignment');
    }
    setSubmitting(false);
  };

  const submitAssignment = async () => {
    if (!submitText.trim()) return toast.error('Please write your submission notes');
    setSubmitting(true);
    try {
      await api.post(`/assignments/${submitOpen._id}/submit`, { textContent: submitText });
      toast.success('Assignment submitted successfully!');
      setSubmitOpen(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting');
    }
    setSubmitting(false);
  };

  const getStatusBadge = (a) => {
    if (a.mySubmission) {
      if (a.mySubmission.status === 'graded') return <span className="badge-success text-[10px]">Graded &bull; {a.mySubmission.marks} pts</span>;
      return <span className="badge-info text-[10px]">Submitted ✓</span>;
    }
    if (isPast(a.dueDate)) return <span className="badge-danger text-[10px]">Overdue</span>;
    const remaining = daysUntil(a.dueDate);
    return <span className={remaining <= 2 ? 'badge-danger text-[10px]' : 'badge-warning text-[10px]'}>{remaining === 0 ? 'Due Today' : `${remaining}d left`}</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
            <span>Coursework Portal</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Assignments & Tasks</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === 'student'
              ? 'Submit pending problem sets, review faculty grades, and stay ahead of deadlines.'
              : 'Create homework assignments, set deadlines, and automatically notify enrolled students.'}
          </p>
        </div>
        {user?.role !== 'student' && (
          <button onClick={() => setCreateOpen(true)} className="btn-pill-primary text-xs">
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Assignment list */}
      <div className="space-y-4">
        {assignments.map((a) => (
          <motion.div
            key={a._id}
            className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] flex items-center justify-center flex-shrink-0 text-[#111827] dark:text-white">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-[#111827] dark:text-white">{a.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{a.subject} {a.subjectCode ? `&bull; ${a.subjectCode}` : ''} &bull; Total: {a.totalMarks || 100} marks</p>
                  {a.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{a.description}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e2e5f0] dark:border-[#22242a]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due {formatDate(a.dueDate)}</span>
              </div>
              {user?.role === 'student' && getStatusBadge(a)}
              {user?.role === 'student' && !a.mySubmission && !isPast(a.dueDate) && (
                <button
                  onClick={() => setSubmitOpen(a)}
                  className="btn-pill-primary text-xs py-2 px-4"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Solution</span>
                </button>
              )}
              {a.mySubmission && <Check className="w-4 h-4 text-emerald-500" />}
            </div>
          </motion.div>
        ))}
        {assignments.length === 0 && (
          <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#111827] dark:text-white">No active assignments posted</p>
            <p className="text-xs text-slate-500 mt-1">Check back later or ask the AI copilot for course updates.</p>
          </div>
        )}
      </div>

      {/* Create Modal (admin) */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Assignment" size="md">
        <form onSubmit={createAssignment} className="space-y-4 text-left">
          <div>
            <label className="label">Assignment Title</label>
            <input className="input-field" placeholder="Lab 3: Dijkstra Algorithm Implementation" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Instructions & Description</label>
            <textarea className="input-field min-h-[90px] resize-none" placeholder="Provide problem statement, test cases, or submission rules..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input className="input-field" placeholder="Data Structures" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="label">Subject Code</label>
              <input className="input-field" placeholder="CS301" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date & Time</label>
              <input type="datetime-local" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input type="number" className="input-field" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
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

      {/* Submit Modal (student) */}
      <Modal isOpen={!!submitOpen} onClose={() => setSubmitOpen(null)} title={`Submit: ${submitOpen?.title}`}>
        <div className="space-y-4 text-left">
          <div>
            <label className="label">Your Solution / Code / Answers</label>
            <textarea
              className="input-field min-h-[140px] resize-none font-mono text-xs"
              placeholder="Paste your code solution, links, or notes here..."
              value={submitText}
              onChange={(e) => setSubmitText(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500">Submission timestamp will be recorded against your institutional profile.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setSubmitOpen(null)} className="btn-pill-secondary flex-1">Cancel</button>
            <button onClick={submitAssignment} className="btn-pill-primary flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm Submission ↗'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignmentsPage;

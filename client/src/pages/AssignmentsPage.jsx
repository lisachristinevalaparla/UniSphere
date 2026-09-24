import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, Upload, Calendar, Check } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
      setAssignments(res.data.assignments);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const createAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/assignments', form);
      toast.success('Assignment created!');
      setCreateOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating assignment');
    }
    setSubmitting(false);
  };

  const submitAssignment = async () => {
    if (!submitText.trim()) return toast.error('Please write your submission');
    setSubmitting(true);
    try {
      await api.post(`/assignments/${submitOpen._id}/submit`, { textContent: submitText });
      toast.success('Assignment submitted!');
      setSubmitOpen(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting');
    }
    setSubmitting(false);
  };

  const getStatusBadge = (a) => {
    if (a.mySubmission) {
      if (a.mySubmission.status === 'graded') return <span className="badge badge-green">Graded — {a.mySubmission.marks} marks</span>;
      return <span className="badge badge-blue">{a.mySubmission.status}</span>;
    }
    if (isPast(a.dueDate)) return <span className="badge badge-red">Overdue</span>;
    return <span className="badge badge-yellow">{daysUntil(a.dueDate) === 0 ? 'Due Today' : `${daysUntil(a.dueDate)}d left`}</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Assignments</h1>
        {user?.role !== 'student' && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Assignment
          </button>
        )}
      </div>

      {/* Assignment list */}
      <div className="space-y-3">
        {assignments.map((a) => (
          <motion.div
            key={a._id}
            className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ x: 2 }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white">{a.title}</h3>
                  <p className="text-xs text-slate-400">{a.subject} {a.subjectCode ? `· ${a.subjectCode}` : ''}</p>
                  {a.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{a.description}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(a.dueDate)}
              </div>
              {user?.role === 'student' && getStatusBadge(a)}
              {user?.role === 'student' && !a.mySubmission && !isPast(a.dueDate) && (
                <button
                  onClick={() => setSubmitOpen(a)}
                  className="btn-primary flex items-center gap-1.5 text-xs px-3 py-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Submit
                </button>
              )}
              {a.mySubmission && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
          </motion.div>
        ))}
        {assignments.length === 0 && (
          <div className="glass-card p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No assignments yet</p>
          </div>
        )}
      </div>

      {/* Create Modal (admin) */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Assignment" size="md">
        <form onSubmit={createAssignment} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="label">Subject Code</label>
              <input className="input-field" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input type="datetime-local" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input type="number" className="input-field" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Modal (student) */}
      <Modal isOpen={!!submitOpen} onClose={() => setSubmitOpen(null)} title={`Submit: ${submitOpen?.title}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Your Answer / Notes</label>
            <textarea
              className="input-field min-h-[120px] resize-none"
              placeholder="Write your answer here..."
              value={submitText}
              onChange={(e) => setSubmitText(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-400">File upload coming soon. Text submission supported now.</p>
          <div className="flex gap-3">
            <button onClick={() => setSubmitOpen(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submitAssignment} className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignmentsPage;

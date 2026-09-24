import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, GraduationCap, Calendar, MapPin } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';

const ExamsPage = () => {
  const { user } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('schedule');
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', subject: '', subjectCode: '', examType: 'midterm',
    date: '', startTime: '', endTime: '', venue: '', totalMarks: 100, passingMarks: 40, instructions: '',
  });

  const fetch = async () => {
    try {
      const [exRes] = await Promise.all([api.get('/exams?limit=30')]);
      setExams(exRes.data.exams);
      if (user?.role === 'student') {
        const rRes = await api.get('/exams/my-results');
        setMyResults(rRes.data.results);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const createExam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/exams', form);
      toast.success('Exam scheduled!');
      setCreateOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
    setSubmitting(false);
  };

  const typeColor = {
    midterm: 'badge-blue', final: 'badge-red', quiz: 'badge-yellow',
    internal: 'badge-cyan', practical: 'badge-green', other: 'badge-gray',
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Examinations</h1>
        {user?.role !== 'student' && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Exam
          </button>
        )}
      </div>

      {/* Tabs (student only) */}
      {user?.role === 'student' && (
        <div className="flex gap-1 p-1 glass-card w-fit rounded-lg">
          {['schedule', 'results'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Exam schedule */}
      {(user?.role !== 'student' || tab === 'schedule') && (
        <div className="space-y-3">
          {exams.map((e) => (
            <motion.div
              key={e._id}
              className="glass-card p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex flex-col items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{e.title}</h3>
                    <span className={`badge ${typeColor[e.examType] || 'badge-gray'}`}>{e.examType}</span>
                    <span className={`badge ${e.status === 'upcoming' ? 'badge-blue' : e.status === 'completed' ? 'badge-green' : 'badge-gray'}`}>{e.status}</span>
                  </div>
                  <p className="text-sm text-slate-300">{e.subject} {e.subjectCode ? `(${e.subjectCode})` : ''}</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(e.date)} {e.startTime && `· ${e.startTime}–${e.endTime}`}
                    </span>
                    {e.venue && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5" /> {e.venue}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">Max: {e.totalMarks} | Pass: {e.passingMarks}</span>
                  </div>
                  {e.instructions && <p className="text-xs text-slate-500 mt-1">{e.instructions}</p>}
                </div>
              </div>
            </motion.div>
          ))}
          {exams.length === 0 && (
            <div className="glass-card p-12 text-center">
              <GraduationCap className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No exams scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* My Results (student) */}
      {user?.role === 'student' && tab === 'results' && (
        <div className="space-y-3">
          {myResults.map((r) => (
            <div key={r._id} className="glass-card p-5 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                r.grade === 'F' ? 'bg-rose-500/15 text-rose-400' :
                ['A+','A'].includes(r.grade) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-indigo-500/15 text-indigo-400'
              }`}>
                {r.grade}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{r.exam?.subject}</h3>
                <p className="text-xs text-slate-400 capitalize">{r.exam?.examType} · {formatDate(r.exam?.date)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{r.marksObtained}</p>
                <p className="text-xs text-slate-400">/ {r.exam?.totalMarks}</p>
              </div>
            </div>
          ))}
          {myResults.length === 0 && (
            <div className="glass-card p-12 text-center">
              <p className="text-slate-400">No results published yet</p>
            </div>
          )}
        </div>
      )}

      {/* Create Exam Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Schedule Exam" size="lg">
        <form onSubmit={createExam} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Title</label>
              <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input-field" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                {['midterm','final','quiz','internal','practical','other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject</label>
              <input className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="label">Subject Code</label>
              <input className="input-field" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="label">Venue</label>
              <input className="input-field" placeholder="Hall A" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input type="time" className="input-field" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" className="input-field" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input type="number" className="input-field" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
            </div>
            <div>
              <label className="label">Passing Marks</label>
              <input type="number" className="input-field" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Instructions</label>
            <textarea className="input-field resize-none min-h-[60px]" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamsPage;

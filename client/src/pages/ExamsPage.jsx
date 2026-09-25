import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, GraduationCap, Calendar, MapPin, Award, Clock } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';

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
      setExams(exRes.data.exams || []);
      if (user?.role === 'student') {
        const rRes = await api.get('/exams/my-results');
        setMyResults(rRes.data.results || []);
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
      toast.success('Exam scheduled & student notifications dispatched!');
      setCreateOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error scheduling exam');
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
            <span>Evaluations & Timetables</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Examinations & Results</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === 'student'
              ? 'Midterm schedules, seat allocations, hall tickets, and published semester grades.'
              : 'Schedule department exams, assign venues, and release examination results.'}
          </p>
        </div>
        {user?.role !== 'student' && (
          <button onClick={() => setCreateOpen(true)} className="btn-pill-primary text-xs">
            <Plus className="w-4 h-4" />
            <span>Schedule Exam</span>
          </button>
        )}
      </div>

      {/* Segmented Pill Tabs */}
      {user?.role === 'student' && (
        <div className="inline-block">
          <div className="segmented-pill-container">
            <button
              onClick={() => setTab('schedule')}
              className={`segmented-pill-item ${tab === 'schedule' ? 'segmented-pill-item-active' : ''}`}
            >
              Exam Timetable ({exams.length})
            </button>
            <button
              onClick={() => setTab('results')}
              className={`segmented-pill-item ${tab === 'results' ? 'segmented-pill-item-active' : ''}`}
            >
              Published Grades ({myResults.length})
            </button>
          </div>
        </div>
      )}

      {/* Exam Schedule Grid */}
      {tab === 'schedule' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((e) => (
            <motion.div
              key={e._id}
              className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 flex flex-col justify-between"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-info capitalize text-[10px]">{e.examType}</span>
                  <span className="text-xs font-bold text-slate-500">{e.totalMarks || 100} Marks</span>
                </div>
                <h3 className="font-bold text-base text-[#111827] dark:text-white">{e.subject}</h3>
                {e.subjectCode && <p className="text-xs font-mono text-slate-500 mt-0.5">{e.subjectCode}</p>}
                {e.title && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{e.title}</p>}
              </div>

              <div className="mt-5 pt-4 border-t border-[#e2e5f0] dark:border-[#22242a] space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(e.date)}</span>
                </div>
                {(e.startTime || e.endTime) && (
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{e.startTime || '10:00 AM'} - {e.endTime || '1:00 PM'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{e.venue || 'Main Examination Block'}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {exams.length === 0 && (
            <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-12 text-center col-span-3">
              <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#111827] dark:text-white">No upcoming examinations scheduled</p>
              <p className="text-xs text-slate-500 mt-1">Timetables will appear when published by faculty.</p>
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {tab === 'results' && (
        <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
            <h2 className="text-sm font-bold text-[#111827] dark:text-white">Verified Academic Grade Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f8f9fd] dark:bg-[#141518] text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  {['Subject', 'Exam Type', 'Marks Obtained', 'Grade', 'Remarks'].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e5f0] dark:divide-[#22242a] text-xs">
                {myResults.map((r) => (
                  <tr key={r._id} className="hover:bg-[#f8f9fd] dark:hover:bg-[#1e2026] transition-colors">
                    <td className="px-6 py-3.5 font-bold text-[#111827] dark:text-white">{r.exam?.subject}</td>
                    <td className="px-6 py-3.5 capitalize text-slate-500">{r.exam?.examType}</td>
                    <td className="px-6 py-3.5 font-semibold text-[#111827] dark:text-white">{r.marksObtained} / {r.exam?.totalMarks || 100}</td>
                    <td className="px-6 py-3.5">
                      <span className={['A+', 'A', 'B+'].includes(r.grade) ? 'badge-success' : r.grade === 'F' ? 'badge-danger' : 'badge-warning'}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{r.remarks || 'Standard Evaluation'}</td>
                  </tr>
                ))}
                {myResults.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-slate-400 py-10">No examination results released yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Schedule Examination" size="md">
        <form onSubmit={createExam} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input className="input-field" placeholder="Algorithms" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="label">Subject Code</label>
              <input className="input-field" placeholder="CS301" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Exam Type</label>
              <select className="input-field" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                {['midterm', 'final', 'quiz', 'practical', 'internal'].map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Exam Date</label>
              <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Time</label>
              <input className="input-field" placeholder="10:00 AM" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input className="input-field" placeholder="1:00 PM" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Venue / Hall</label>
              <input className="input-field" placeholder="Hall 402" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input type="number" className="input-field" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-pill-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-pill-primary flex-1" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule & Notify ↗'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamsPage;

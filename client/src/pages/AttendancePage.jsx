import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertTriangle, CheckCircle, Clock, Plus, Check } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState({ summary: [], records: [] });
  const [loading, setLoading] = useState(true);

  // Admin state
  const [markForm, setMarkForm] = useState({
    studentId: '',
    subject: '',
    subjectCode: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
  });
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (user?.role === 'student') {
          const res = await api.get('/attendance/my');
          setData(res.data);
        } else {
          const res = await api.get('/attendance?limit=50');
          setData({ summary: [], records: res.data.records || [] });
          // Fetch all students for marking
          const usersRes = await api.get('/auth/users').catch(() => ({ data: { users: [] } }));
          setStudents(usersRes.data.users || []);
        }
      } catch (err) {
        console.error('Error loading attendance:', err);
      }
      setLoading(false);
    };
    fetch();
  }, [user?.role]);

  const markAttendance = async (e) => {
    e.preventDefault();
    if (!markForm.studentId || !markForm.subject) {
      toast.error('Please select a student and enter the subject');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/attendance', {
        records: [{ ...markForm }],
      });
      toast.success('Attendance recorded and synchronized!');
      // Refresh admin records
      const res = await api.get('/attendance?limit=50');
      setData({ summary: [], records: res.data.records || [] });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking attendance');
    }
    setSubmitting(false);
  };

  const getStatusBadge = (pct) => {
    if (pct >= 75) return <span className="badge-success text-[10px]">Good ({pct}%)</span>;
    if (pct >= 65) return <span className="badge-warning text-[10px]">At Risk ({pct}%)</span>;
    return <span className="badge-danger text-[10px]">Critical ({pct}%)</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
            <span>Academic Performance</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Attendance Portal</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === 'student'
              ? 'Track subject-wise lecture attendance, minimum percentage thresholds, and session history.'
              : 'Log classroom attendance batches and oversee department compliance.'}
          </p>
        </div>
      </div>

      {user?.role === 'student' ? (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.summary || []).map((s) => (
              <motion.div
                key={s.subject}
                className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#111827] dark:text-white">{s.subject}</h3>
                    {s.subjectCode && <p className="text-[11px] text-slate-500 font-mono mt-0.5">{s.subjectCode}</p>}
                  </div>
                  {getStatusBadge(s.percentage)}
                </div>

                <p className="text-3xl font-black tracking-tight mb-1" style={{ color: s.isLow ? '#ef4444' : '#10b981' }}>
                  {s.percentage}%
                </p>
                <p className="text-xs text-slate-500 font-medium">{s.present} of {s.total} lectures attended</p>

                {/* Progress bar */}
                <div className="h-2 bg-[#e2e5f0] dark:bg-[#252831] rounded-full mt-4 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s.isLow ? '#ef4444' : '#10b981' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(s.percentage, 100)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                {s.isLow && (
                  <div className="mt-3 p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Need {Math.ceil((0.75 * s.total - s.present) / 0.25)} more sessions to reach 75%</span>
                  </div>
                )}
              </motion.div>
            ))}
            {data.summary.length === 0 && (
              <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-10 text-center col-span-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#111827] dark:text-white">No attendance records logged yet</p>
                <p className="text-xs text-slate-500 mt-1">Records will appear as faculty mark sessions.</p>
              </div>
            )}
          </div>

          {/* Recent Records Table */}
          {data.records?.length > 0 && (
            <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
                <h2 className="text-sm font-bold text-[#111827] dark:text-white">Recent Attendance Sessions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8f9fd] dark:bg-[#141518] text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      {['Date', 'Subject', 'Status'].map((h) => (
                        <th key={h} className="px-6 py-3.5 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e5f0] dark:divide-[#22242a] text-xs">
                    {data.records.slice(0, 20).map((r) => (
                      <tr key={r._id} className="hover:bg-[#f8f9fd] dark:hover:bg-[#1e2026] transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-600 dark:text-slate-400">
                          {new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-[#111827] dark:text-white">{r.subject}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                            r.status === 'present' ? 'badge-success' :
                            r.status === 'late' ? 'badge-warning' :
                            r.status === 'excused' ? 'badge-info' : 'badge-danger'
                          }`}>
                            {r.status === 'present' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span className="capitalize">{r.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Admin: mark attendance form */
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="card-popout lg:col-span-5 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8">
            <h2 className="text-base font-bold text-[#111827] dark:text-white mb-2">Record Session Attendance</h2>
            <p className="text-xs text-slate-500 mb-6">Select a student and course to record attendance status.</p>

            <form onSubmit={markAttendance} className="space-y-4">
              <div>
                <label className="label">Select Student</label>
                <select
                  className="input-field"
                  value={markForm.studentId}
                  onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.rollNumber || st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Subject</label>
                  <input
                    className="input-field"
                    placeholder="Data Structures"
                    value={markForm.subject}
                    onChange={(e) => setMarkForm({ ...markForm, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Subject Code</label>
                  <input
                    className="input-field"
                    placeholder="CS301"
                    value={markForm.subjectCode}
                    onChange={(e) => setMarkForm({ ...markForm, subjectCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={markForm.date}
                    onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input-field"
                    value={markForm.status}
                    onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })}
                  >
                    {['present', 'absent', 'late', 'excused'].map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-pill-primary w-full py-3 text-sm mt-3" disabled={submitting}>
                {submitting ? 'Recording...' : 'Log Attendance Entry ↗'}
              </button>
            </form>
          </div>

          <div className="card-popout lg:col-span-7 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
              <h2 className="text-sm font-bold text-[#111827] dark:text-white">Recent Logged Sessions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f9fd] dark:bg-[#141518] text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    {['Student', 'Subject', 'Date', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e5f0] dark:divide-[#22242a] text-xs">
                  {(data.records || []).slice(0, 15).map((r) => (
                    <tr key={r._id} className="hover:bg-[#f8f9fd] dark:hover:bg-[#1e2026] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#111827] dark:text-white">{r.student?.name || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{r.subject}</td>
                      <td className="px-5 py-3.5 text-slate-500">{new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.status === 'present' ? 'badge-success' : r.status === 'absent' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          <span className="capitalize">{r.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(data.records || []).length === 0 && (
                    <tr><td colSpan={4} className="text-center text-slate-400 py-8">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;

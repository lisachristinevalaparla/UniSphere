import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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
    studentId: '', subject: '', subjectCode: '', date: new Date().toISOString().split('T')[0], status: 'present',
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
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [user?.role]);

  const markAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/attendance', {
        records: [{ ...markForm }],
      });
      toast.success('Attendance marked!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking attendance');
    }
    setSubmitting(false);
  };

  const getStatusBadge = (pct) => {
    if (pct >= 75) return <span className="badge badge-green">Good</span>;
    if (pct >= 60) return <span className="badge badge-yellow">At Risk</span>;
    return <span className="badge badge-red">Low ⚠</span>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="page-title">Attendance</h1>

      {user?.role === 'student' ? (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data.summary || []).map((s) => (
              <motion.div
                key={s.subject}
                className="glass-card p-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{s.subject}</h3>
                    {s.subjectCode && <p className="text-xs text-slate-400">{s.subjectCode}</p>}
                  </div>
                  {getStatusBadge(s.percentage)}
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: s.isLow ? '#F43F5E' : '#10B981' }}>
                  {s.percentage}%
                </p>
                <p className="text-xs text-slate-400">{s.present}/{s.total} classes attended</p>
                {/* Progress bar */}
                <div className="h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: s.isLow ? '#F43F5E' : '#10B981' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percentage}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                {s.isLow && (
                  <p className="text-[10px] text-amber-400 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Need {Math.ceil((0.75 * s.total - s.present) / 0.25)} more classes to reach 75%
                  </p>
                )}
              </motion.div>
            ))}
            {data.summary.length === 0 && (
              <div className="glass-card p-8 text-center col-span-3">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No attendance records found</p>
              </div>
            )}
          </div>

          {/* Recent Records */}
          {data.records?.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-sm font-semibold text-white">Recent Attendance Log</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      {['Date', 'Subject', 'Status'].map((h) => (
                        <th key={h} className="table-header">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.slice(0, 20).map((r) => (
                      <tr key={r._id} className="table-row">
                        <td className="table-cell">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                        <td className="table-cell">{r.subject}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            r.status === 'present' ? 'badge-green' :
                            r.status === 'late' ? 'badge-yellow' :
                            r.status === 'excused' ? 'badge-blue' : 'badge-red'
                          }`}>
                            {r.status === 'present' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {r.status}
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
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Mark Attendance</h2>
            <form onSubmit={markAttendance} className="space-y-4">
              <div>
                <label className="label">Student ID</label>
                <input
                  className="input-field"
                  placeholder="MongoDB ObjectId of student"
                  value={markForm.studentId}
                  onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
                  required
                />
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
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Marking...' : 'Mark Attendance'}
              </button>
            </form>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white">Recent Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    {['Student', 'Subject', 'Date', 'Status'].map((h) => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.records || []).slice(0, 15).map((r) => (
                    <tr key={r._id} className="table-row">
                      <td className="table-cell">{r.student?.name || '—'}</td>
                      <td className="table-cell">{r.subject}</td>
                      <td className="table-cell">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                      <td className="table-cell">
                        <span className={`badge ${r.status === 'present' ? 'badge-green' : r.status === 'absent' ? 'badge-red' : 'badge-yellow'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(data.records || []).length === 0 && (
                    <tr><td colSpan={4} className="table-cell text-center text-slate-400 py-6">No records</td></tr>
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

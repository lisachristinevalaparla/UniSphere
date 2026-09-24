import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, ClipboardList, GraduationCap, Briefcase,
  AlertTriangle, Calendar, Bell, TrendingUp, Award,
  Sparkles, ArrowRight, CheckCircle2, ChevronRight,
  Clock, ShieldAlert, Bot
} from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import StatCard from '../components/StatCard';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A';
const daysUntil = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000));

const Dashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'student') {
          const res = await api.get('/dashboard');
          setData(res.data);
        } else {
          const res = await api.get('/dashboard/admin');
          setAdminData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-1/3"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-32 rounded-2xl"></div>
          <div className="skeleton h-32 rounded-2xl"></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="skeleton h-64 rounded-xl"></div>
          <div className="skeleton h-64 rounded-xl"></div>
          <div className="skeleton h-64 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // ─── Faculty / Admin Dashboard ────────────────────────────────────────
  if (user?.role !== 'student') {
    const stats = adminData || {};
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Command Center</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Institutional summary and academic operations overview
            </p>
          </div>
          <Link to="/admin/analytics" className="btn-primary text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>View Full Analytics</span>
          </Link>
        </div>

        {/* Glassmorphic Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents ?? 0}
            subtitle="Enrolled Campus-Wide"
            icon={BookOpen}
            color="indigo"
          />
          <StatCard
            title="Active Assignments"
            value={stats.totalAssignments ?? 0}
            subtitle="Curriculum Coursework"
            icon={ClipboardList}
            color="cyan"
          />
          <StatCard
            title="Active Placements"
            value={stats.openPlacements ?? 0}
            subtitle="Open Campus Drives"
            icon={Briefcase}
            color="emerald"
          />
          <StatCard
            title="Pending Submissions"
            value={stats.pendingSubmissions ?? 0}
            subtitle="Awaiting Faculty Review"
            icon={AlertTriangle}
            color="amber"
          />
        </div>

        {/* Quick Admin Actions & Overview */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="flat-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Institutional Health</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Daily automated checks on system performance, attendance rates, and active examinations.
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300">Live Database Status</span>
                <span className="badge-success">MongoDB Atlas Active</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300">AI Assistant Grounding</span>
                <span className="badge-info">Ready</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300">Upcoming Exams Scheduled</span>
                <span className="font-semibold text-slate-900 dark:text-white">{stats.upcomingExamsCount ?? 4} Exams</span>
              </div>
            </div>
          </div>

          <div className="flat-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Management Quick Links</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Access department modules to publish updates, mark attendance, or upload resources.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Link to="/attendance" className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-800 dark:text-slate-200 block text-center">
                  Take Attendance
                </Link>
                <Link to="/assignments" className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-800 dark:text-slate-200 block text-center">
                  Create Assignment
                </Link>
                <Link to="/exams" className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-800 dark:text-slate-200 block text-center">
                  Schedule Exam
                </Link>
                <Link to="/materials" className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-800 dark:text-slate-200 block text-center">
                  Upload Notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Student Dashboard ───────────────────────────────────────────────
  const { attendance, upcomingAssignments, upcomingExams, recentResults, upcomingEvents } = data || {};

  return (
    <div className="space-y-6">
      {/* Header with Greeting & AI Quick Sparkle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.department && `${user.department} · `}
            {user?.year && `Year ${user.year} · `}
            {user?.semester && `Semester ${user.semester}`}
          </p>
        </motion.div>

        <Link
          to="/ai-assistant"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ask AI: What should I focus on?</span>
        </Link>
      </div>

      {/* 1. GLASSMORPHIC SUMMARY STAT CARDS (Selective Glassmorphism) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendance?.overall ?? 0}%`}
          subtitle={attendance?.lowCount > 0 ? `${attendance.lowCount} subject(s) below 75%` : 'Attendance is in good standing'}
          icon={BookOpen}
          color={(attendance?.overall ?? 0) >= 75 ? 'emerald' : (attendance?.overall ?? 0) >= 65 ? 'amber' : 'rose'}
        />
        <StatCard
          title="Due Assignments"
          value={upcomingAssignments?.length ?? 0}
          subtitle="Pending submission"
          icon={ClipboardList}
          color="amber"
        />
        <StatCard
          title="Upcoming Exams"
          value={upcomingExams?.length ?? 0}
          subtitle="Scheduled this term"
          icon={GraduationCap}
          color="cyan"
        />
        <StatCard
          title="Campus Placements"
          value={data?.myApplications?.length ?? 0}
          subtitle="Active Applications"
          icon={Briefcase}
          color="indigo"
        />
      </div>

      {/* Low Attendance Warning Alert (if any) */}
      {attendance?.lowCount > 0 && (
        <motion.div
          className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 shadow-sm"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-700 dark:text-rose-300 text-sm">Attendance Shortage Warning</p>
            <p className="mt-1 text-slate-700 dark:text-slate-300">
              You are currently below the mandatory 75% attendance criteria in:{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-semibold">
                {attendance.lowSubjects.map((s) => `${s.subject} (${s.percentage}%)`).join(', ')}
              </strong>
              . Attend all scheduled lectures to ensure examination eligibility.
            </p>
          </div>
        </motion.div>
      )}

      {/* 2. MAIN WORKSPACE GRID (Flat Minimalism for dense academic data) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance by Course Module */}
        <div className="flat-card p-5 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance By Subject</h3>
            </div>
            <Link to="/attendance" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              View Log
            </Link>
          </div>

          <div className="space-y-3.5">
            {(attendance?.subjects || []).slice(0, 5).map((s) => {
              const isSafe = s.percentage >= 75;
              const isWarning = s.percentage >= 65 && s.percentage < 75;
              return (
                <div key={s.subject} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{s.subject}</span>
                    <span className={`font-bold ${isSafe ? 'text-emerald-600 dark:text-emerald-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isSafe ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(s.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {(attendance?.subjects || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No attendance records logged yet</p>
            )}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="flat-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Assignments</h3>
            </div>
            <Link to="/assignments" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              All Tasks
            </Link>
          </div>

          <div className="space-y-3">
            {(upcomingAssignments || []).slice(0, 4).map((a) => {
              const remainingDays = daysUntil(a.dueDate);
              return (
                <div key={a._id} className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{a.subject}</p>
                  </div>
                  <span className={`shrink-0 ${remainingDays <= 2 ? 'badge-danger' : 'badge-warning'}`}>
                    {remainingDays === 0 ? 'Due Today' : `${remainingDays}d left`}
                  </span>
                </div>
              );
            })}
            {(upcomingAssignments || []).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">All Assignments Submitted!</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Examinations */}
        <div className="flat-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Exam Schedule</h3>
            </div>
            <Link to="/exams" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Full Timetable
            </Link>
          </div>

          <div className="space-y-3">
            {(upcomingExams || []).slice(0, 4).map((e) => (
              <div key={e._id} className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{e.subject}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{e.examType} · {e.startTime || 'TBD'}</p>
                </div>
                <span className="badge-info shrink-0">{formatDate(e.date)}</span>
              </div>
            ))}
            {(upcomingExams || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">No scheduled exams this week</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. LOWER SECTION: Recent Results & Upcoming Campus Events */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="flat-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Published Results & Marks</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(recentResults || []).slice(0, 4).map((r) => (
              <div key={r._id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{r.exam?.subject}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{r.exam?.examType}</p>
                </div>
                <div className="text-right">
                  <span className={['A+', 'A', 'B+'].includes(r.grade) ? 'badge-success' : r.grade === 'F' ? 'badge-danger' : 'badge-warning'}>
                    Grade: {r.grade}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">{r.marksObtained} Marks</div>
                </div>
              </div>
            ))}
            {(recentResults || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No published results yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="flat-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Events & Club Activities</h3>
            </div>
            <Link to="/events" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Explore All
            </Link>
          </div>

          <div className="space-y-2.5">
            {(upcomingEvents || []).slice(0, 3).map((ev) => (
              <div key={ev._id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold leading-none">{new Date(ev.startDate).getDate()}</span>
                  <span className="text-[9px] uppercase font-semibold mt-0.5">{new Date(ev.startDate).toLocaleString('en', { month: 'short' })}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{ev.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{ev.venue || 'Campus Auditorium'}</p>
                </div>
              </div>
            ))}
            {(upcomingEvents || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No upcoming campus events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

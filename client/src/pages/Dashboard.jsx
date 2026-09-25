import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, ClipboardList, GraduationCap, Briefcase,
  AlertTriangle, Calendar, TrendingUp, Award,
  Sparkles, CheckCircle2, ChevronRight,
  ShieldAlert, ArrowUpRight
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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="skeleton h-10 w-1/3 rounded-full"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="skeleton h-32 rounded-3xl"></div>
          <div className="skeleton h-32 rounded-3xl"></div>
          <div className="skeleton h-32 rounded-3xl"></div>
          <div className="skeleton h-32 rounded-3xl"></div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="skeleton h-64 rounded-3xl"></div>
          <div className="skeleton h-64 rounded-3xl"></div>
          <div className="skeleton h-64 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // ─── Faculty / Admin Dashboard ────────────────────────────────────────
  if (user?.role !== 'student') {
    const stats = adminData || {};
    return (
      <div className="space-y-8 max-w-7xl mx-auto text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
              <span>Admin Operations</span>
            </div>
            <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Command Center</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Institutional performance summary and academic curriculum oversight
            </p>
          </div>
          <Link to="/admin/analytics" className="btn-pill-primary text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>View Full Analytics</span>
          </Link>
        </div>

        {/* Summary Stat Cards */}
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
            subtitle="Curriculum Tasks"
            icon={ClipboardList}
            color="purple"
          />
          <StatCard
            title="Open Placements"
            value={stats.openPlacements ?? 0}
            subtitle="Recruitment Drives"
            icon={Briefcase}
            color="emerald"
          />
          <StatCard
            title="Pending Submissions"
            value={stats.pendingSubmissions ?? 0}
            subtitle="Awaiting Faculty Review"
            icon={AlertTriangle}
            color="rose"
          />
        </div>

        {/* Quick Admin Actions & Overview */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8">
            <h3 className="text-base font-bold text-[#111827] dark:text-white mb-2">Institutional System Health</h3>
            <p className="text-xs text-slate-500 mb-5">
              Daily automated monitoring of attendance minimums, examination timelines, and email dispatches.
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                <span className="font-semibold text-[#111827] dark:text-white">Email Notification Delivery</span>
                <span className="badge-success text-[10px]">Nodemailer Active</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                <span className="font-semibold text-[#111827] dark:text-white">AI Study Assistant Copilot</span>
                <span className="badge-info text-[10px]">Grounding Synced</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                <span className="font-semibold text-[#111827] dark:text-white">Scheduled Midterms</span>
                <span className="font-bold text-[#111827] dark:text-white">{stats.upcomingExamsCount ?? 4} Exams</span>
              </div>
            </div>
          </div>

          <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-white mb-2">Faculty Management Portals</h3>
              <p className="text-xs text-slate-500 mb-5">
                Take attendance, distribute verified syllabus notes, or post assignment criteria.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Link to="/attendance" className="card-popout p-3.5 rounded-2xl border border-[#e2e5f0] dark:border-[#2b2e38] bg-[#f8f9fd] dark:bg-[#141518] font-bold text-[#111827] dark:text-white block text-center">
                  Take Attendance ↗
                </Link>
                <Link to="/assignments" className="card-popout p-3.5 rounded-2xl border border-[#e2e5f0] dark:border-[#2b2e38] bg-[#f8f9fd] dark:bg-[#141518] font-bold text-[#111827] dark:text-white block text-center">
                  Post Assignment ↗
                </Link>
                <Link to="/exams" className="card-popout p-3.5 rounded-2xl border border-[#e2e5f0] dark:border-[#2b2e38] bg-[#f8f9fd] dark:bg-[#141518] font-bold text-[#111827] dark:text-white block text-center">
                  Schedule Exam ↗
                </Link>
                <Link to="/materials" className="card-popout p-3.5 rounded-2xl border border-[#e2e5f0] dark:border-[#2b2e38] bg-[#f8f9fd] dark:bg-[#141518] font-bold text-[#111827] dark:text-white block text-center">
                  Upload Notes ↗
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
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header with Greeting & AI Copilot Sparkle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
            <span>🎓 Semester Workspace</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.department && `${user.department} &bull; `}
            {user?.year && `Year ${user.year} &bull; `}
            {user?.semester && `Semester ${user.semester}`}
          </p>
        </motion.div>

        <Link
          to="/ai-assistant"
          className="btn-pill-primary text-xs self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>Ask Copilot: What should I focus on?</span>
        </Link>
      </div>

      {/* 1. SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attendance?.overall ?? 0}%`}
          subtitle={attendance?.lowCount > 0 ? `${attendance.lowCount} subject(s) below 75%` : 'Good academic standing'}
          icon={BookOpen}
          color={(attendance?.overall ?? 0) >= 75 ? 'emerald' : (attendance?.overall ?? 0) >= 65 ? 'amber' : 'rose'}
        />
        <StatCard
          title="Pending Tasks"
          value={upcomingAssignments?.length ?? 0}
          subtitle="Coursework submissions"
          icon={ClipboardList}
          color="amber"
        />
        <StatCard
          title="Upcoming Exams"
          value={upcomingExams?.length ?? 0}
          subtitle="Term examinations"
          icon={GraduationCap}
          color="cyan"
        />
        <StatCard
          title="Campus Placements"
          value={data?.myApplications?.length ?? 0}
          subtitle="Active applications"
          icon={Briefcase}
          color="indigo"
        />
      </div>

      {/* Low Attendance Warning Alert (if any) */}
      {attendance?.lowCount > 0 && (
        <motion.div
          className="card-popout flex items-start gap-3.5 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-700 dark:text-rose-300 text-sm">Attendance Threshold Warning</p>
            <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
              You are currently below the mandatory 75% attendance criteria in:{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-bold">
                {attendance.lowSubjects.map((s) => `${s.subject} (${s.percentage}%)`).join(', ')}
              </strong>
              . Attend all scheduled lectures to maintain examination eligibility.
            </p>
          </div>
        </motion.div>
      )}

      {/* 2. MAIN WORKSPACE GRID */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance by Course Module */}
        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e5f0] dark:border-[#22242a] mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#111827] dark:text-white" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">Attendance By Subject</h3>
            </div>
            <Link to="/attendance" className="text-xs font-bold text-[#111827] dark:text-white hover:underline">
              View Log ↗
            </Link>
          </div>

          <div className="space-y-4">
            {(attendance?.subjects || []).slice(0, 5).map((s) => {
              const isSafe = s.percentage >= 75;
              const isWarning = s.percentage >= 65 && s.percentage < 75;
              return (
                <div key={s.subject} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#111827] dark:text-[#f3f4f6] truncate">{s.subject}</span>
                    <span className={isSafe ? 'text-emerald-600 font-bold' : isWarning ? 'text-purple-600 font-bold' : 'text-rose-600 font-bold'}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#e2e5f0] dark:bg-[#252831] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isSafe ? 'bg-emerald-500' : isWarning ? 'bg-purple-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(s.percentage, 100)}%` }}
                    />
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
        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e5f0] dark:border-[#22242a] mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#111827] dark:text-white" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">Pending Assignments</h3>
            </div>
            <Link to="/assignments" className="text-xs font-bold text-[#111827] dark:text-white hover:underline">
              All Tasks ↗
            </Link>
          </div>

          <div className="space-y-3">
            {(upcomingAssignments || []).slice(0, 4).map((a) => {
              const remainingDays = daysUntil(a.dueDate);
              return (
                <div key={a._id} className="p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#111827] dark:text-white truncate">{a.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.subject}</p>
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
                <p className="text-xs font-bold text-[#111827] dark:text-white">All Coursework Submitted!</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Examinations */}
        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e5f0] dark:border-[#22242a] mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#111827] dark:text-white" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">Exam Timetable</h3>
            </div>
            <Link to="/exams" className="text-xs font-bold text-[#111827] dark:text-white hover:underline">
              Full Schedule ↗
            </Link>
          </div>

          <div className="space-y-3">
            {(upcomingExams || []).slice(0, 4).map((e) => (
              <div key={e._id} className="p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#111827] dark:text-white truncate">{e.subject}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{e.examType} &bull; {e.startTime || '10:00 AM'}</p>
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
        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e5f0] dark:border-[#22242a] mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#111827] dark:text-white" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">Published Results & Marks</h3>
            </div>
          </div>

          <div className="divide-y divide-[#e2e5f0] dark:divide-[#22242a]">
            {(recentResults || []).slice(0, 4).map((r) => (
              <div key={r._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#111827] dark:text-white">{r.exam?.subject}</p>
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
              <p className="text-xs text-slate-400 text-center py-6">No published marks yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e5f0] dark:border-[#22242a] mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#111827] dark:text-white" />
              <h3 className="text-sm font-bold text-[#111827] dark:text-white">Events & Club Activities</h3>
            </div>
            <Link to="/events" className="text-xs font-bold text-[#111827] dark:text-white hover:underline">
              Explore All ↗
            </Link>
          </div>

          <div className="space-y-3">
            {(upcomingEvents || []).slice(0, 3).map((ev) => (
              <div key={ev._id} className="card-popout p-3 rounded-2xl border border-[#e2e5f0] dark:border-[#2b2e38] bg-[#f8f9fd] dark:bg-[#141518] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1e2027] border border-[#e2e5f0] dark:border-[#2b2e38] text-[#111827] dark:text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold leading-none">{new Date(ev.startDate).getDate()}</span>
                  <span className="text-[9px] uppercase font-semibold mt-0.5">{new Date(ev.startDate).toLocaleString('en', { month: 'short' })}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#111827] dark:text-white truncate">{ev.title}</p>
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

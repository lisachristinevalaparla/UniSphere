import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCheck, Trash2, BookOpen, ClipboardList, GraduationCap, Calendar, Briefcase, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data.notifications || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
            <span>Email Delivery System</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Email Alerts & Audit Log</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            All assignment updates, exam dates, low attendance alerts, and placement postings are delivered directly to <strong className="text-[#111827] dark:text-white">{user?.email}</strong>.
          </p>
        </div>
      </div>

      {/* Email Delivery Notice Card */}
      <div className="card-popout bg-[#f8f9fd] dark:bg-[#16181d] border border-[#e2e5f0] dark:border-[#272a33] rounded-3xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#111827] dark:text-white mb-1">Automated Nodemailer Dispatch</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            UniSphere automatically triggers branded HTML emails for 24-hour assignment deadlines, examination timetables, and attendance warnings whenever you drop below the mandatory 75% threshold.
          </p>
        </div>
      </div>

      {/* Audit Log Feed */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <motion.div
            key={n._id}
            className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-2xl p-5 flex items-start gap-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-9 h-9 rounded-full bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] flex items-center justify-center flex-shrink-0 text-[#111827] dark:text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#111827] dark:text-white">{n.title || n.subject}</p>
                <span className="text-[10px] font-medium text-slate-400">{timeAgo(n.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge-chip capitalize text-[9px]">{n.type || 'alert'}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Delivered via SMTP</span>
              </div>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-12 text-center">
            <Mail className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-[#111827] dark:text-white">No email dispatches recorded</p>
            <p className="text-xs text-slate-500 mt-1">Campus updates and automated alerts will appear here as they are emailed to you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

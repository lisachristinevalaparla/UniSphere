import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, BookOpen, ClipboardList, GraduationCap, Calendar, Briefcase } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const typeIcons = {
  assignment: ClipboardList,
  exam: GraduationCap,
  event: Calendar,
  placement: Briefcase,
  attendance: BookOpen,
  material: BookOpen,
  general: Bell,
};

const typeColors = {
  assignment: '#F59E0B', exam: '#22D3EE', event: '#10B981',
  placement: '#6366F1', attendance: '#F43F5E', general: '#8B5CF6',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Deleted');
    } catch {}
  };

  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-400 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            const color = typeColors[n.type] || '#8B5CF6';
            return (
              <motion.div
                key={n._id}
                className={`glass-card px-5 py-4 flex items-start gap-4 group ${!n.isRead ? 'border-l-2' : ''}`}
                style={!n.isRead ? { borderLeftColor: color } : {}}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                layout
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: color + '20' }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className={`text-sm font-semibold ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                      title="Mark read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(n._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {notifications.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

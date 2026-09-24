import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Sun,
  Moon,
  Bot,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
      localStorage.getItem('theme') === 'dark';
  });

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications?limit=5');
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Mobile Toggle & Quick AI Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/ai-assistant"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Academic Assistant</span>
          </Link>
        </div>

        {/* Right Actions: Dark Mode Toggle, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              id="notif-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-80 glass-panel overflow-hidden shadow-2xl z-50"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-slate-400 text-xs py-6">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className={`px-4 py-3 text-xs ${n.isRead ? 'opacity-60' : ''}`}>
                          <p className="font-semibold text-slate-900 dark:text-white mb-0.5">{n.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 py-2.5 border-t border-slate-200/60 dark:border-slate-800/80"
                    onClick={() => setNotifOpen(false)}
                  >
                    View All Notifications
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="user-menu-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-52 glass-panel overflow-hidden shadow-2xl z-50 p-1"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user?.role} · {user?.department || 'University'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/ai-assistant');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
                    >
                      <Bot className="w-4 h-4 text-indigo-500" /> AI Assistant
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

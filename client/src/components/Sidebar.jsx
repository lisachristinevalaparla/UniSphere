import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Calendar,
  Briefcase,
  Bell,
  Users,
  ChevronLeft,
  Sparkles,
  X,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['student', 'admin', 'faculty'] },
  { to: '/ai-assistant', icon: Bot, label: 'AI Assistant', roles: ['student', 'admin', 'faculty'], highlight: true },
  { to: '/attendance', icon: BookOpen, label: 'Attendance', roles: ['student', 'admin', 'faculty'] },
  { to: '/assignments', icon: ClipboardList, label: 'Assignments', roles: ['student', 'admin', 'faculty'] },
  { to: '/exams', icon: GraduationCap, label: 'Examinations', roles: ['student', 'admin', 'faculty'] },
  { to: '/materials', icon: FileText, label: 'Course Materials', roles: ['student', 'admin', 'faculty'] },
  { to: '/events', icon: Calendar, label: 'Events & Clubs', roles: ['student', 'admin', 'faculty'] },
  { to: '/placements', icon: Briefcase, label: 'Placements', roles: ['student', 'admin', 'faculty'] },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'faculty'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['student', 'admin', 'faculty'] },
];

const Sidebar = ({ collapsed, onCollapse, mobileOpen, onMobileClose }) => {
  const { user } = useAuthStore();

  const filteredItems = navItems.filter((item) => item.roles.includes(user?.role));

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">UniSphere</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">AI</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
        )}

        {/* Desktop collapse toggle */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          style={{ marginLeft: collapsed ? 'auto' : undefined }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'faculty' ? 'Faculty Portal' : 'Student Workspace'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                  : item.highlight
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <span className="truncate flex-1">{item.label}</span>
            )}
            {!collapsed && item.highlight && (
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.department || user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden z-20"
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {content}
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full z-50 w-64 flex flex-col lg:hidden shadow-2xl"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

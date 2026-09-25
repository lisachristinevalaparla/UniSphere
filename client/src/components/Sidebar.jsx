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
  Mail,
  Users,
  ChevronLeft,
  Sparkles,
  X,
  User,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['student', 'admin', 'faculty'] },
  { to: '/ai-assistant', icon: Bot, label: 'AI Copilot', roles: ['student', 'admin', 'faculty'], highlight: true },
  { to: '/profile', icon: User, label: 'My Profile', roles: ['student', 'admin', 'faculty'] },
  { to: '/attendance', icon: BookOpen, label: 'Attendance', roles: ['student', 'admin', 'faculty'] },
  { to: '/assignments', icon: ClipboardList, label: 'Assignments', roles: ['student', 'admin', 'faculty'] },
  { to: '/exams', icon: GraduationCap, label: 'Examinations', roles: ['student', 'admin', 'faculty'] },
  { to: '/materials', icon: FileText, label: 'Course Materials', roles: ['student', 'admin', 'faculty'] },
  { to: '/events', icon: Calendar, label: 'Events & Clubs', roles: ['student', 'admin', 'faculty'] },
  { to: '/placements', icon: Briefcase, label: 'Placements', roles: ['student', 'admin', 'faculty'] },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'faculty'] },
  { to: '/notifications', icon: Mail, label: 'Email Alerts', roles: ['student', 'admin', 'faculty'] },
];

const Sidebar = ({ collapsed, onCollapse, mobileOpen, onMobileClose }) => {
  const { user } = useAuthStore();

  const filteredItems = navItems.filter((item) => item.roles.includes(user?.role));

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#15171c] border-r border-[#e2e5f0] dark:border-[#26282e] transition-colors duration-200">
      {/* Logo Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[#e2e5f0] dark:border-[#26282e] flex-shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="w-8 h-8 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] shadow-sm shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-[#111827] dark:text-white">UniSphere</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#e6e9f6] dark:bg-[#252831] text-[#374151] dark:text-[#d1d5db]">AI</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] mx-auto shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
        )}

        {/* Desktop collapse toggle */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-full text-slate-400 hover:text-black dark:hover:text-white hover:bg-[#e6e9f6] dark:hover:bg-[#252831] transition-all"
          style={{ marginLeft: collapsed ? 'auto' : undefined }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-black dark:hover:text-white hover:bg-[#e6e9f6] dark:hover:bg-[#252831]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-[#e2e5f0] dark:border-[#22242a]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8f9fd] dark:bg-[#1a1c22] border border-[#e2e5f0] dark:border-[#272a33]">
            <Users className="w-3.5 h-3.5 text-[#111827] dark:text-white" />
            <span className="text-[11px] font-bold text-[#374151] dark:text-[#d1d5db] capitalize">
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'faculty' ? 'Faculty Portal' : 'Student Workspace'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#111827] text-white dark:bg-white dark:text-[#111827] shadow-sm font-bold'
                  : item.highlight
                  ? 'text-[#111827] dark:text-white bg-[#f0f2fa] dark:bg-[#1e2027] border border-[#e2e5f0] dark:border-[#2b2e38] hover:border-black dark:hover:border-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-[#f8f9fd] dark:hover:bg-[#1e2026]'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <span className="truncate flex-1">{item.label}</span>
            )}
            {!collapsed && item.highlight && (
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile */}
      {!collapsed && (
        <div className="p-3 border-t border-[#e2e5f0] dark:border-[#26282e]">
          <NavLink
            to="/profile"
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800/50 shadow-sm'
                  : 'bg-[#f8f9fd] dark:bg-[#1a1c22] border-[#e2e5f0] dark:border-[#272a33] hover:border-black dark:hover:border-white'
              }`
            }
            title="View & Edit My Profile"
          >
            <div className="w-7 h-7 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-[10px] font-bold text-white dark:text-[#111827] shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#111827] dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.department || user?.email}</p>
            </div>
          </NavLink>
        </div>
      )}
    </div>
  );

  return (
    <>
      <motion.aside
        className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden z-20"
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {content}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
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

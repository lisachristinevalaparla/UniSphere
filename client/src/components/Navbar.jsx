import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Bot,
  Sparkles,
  Mail,
  GraduationCap,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/useThemeStore';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#f8f9fd]/85 dark:bg-[#111215]/85 backdrop-blur-md border-b border-[#e2e5f0] dark:border-[#26282e] transition-colors duration-200">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Quick AI Link */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-full text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white hover:bg-[#e6e9f6] dark:hover:bg-[#252831] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/ai-assistant"
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#1c1e24] border border-[#e2e5f0] dark:border-[#2b2e38] text-[#111827] dark:text-white text-xs font-semibold hover:border-black dark:hover:border-white shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Copilot</span>
          </Link>
        </div>

        {/* Right Actions: Theme Toggle, Email Status, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Email Notifications Badge / Link */}
          <Link
            to="/notifications"
            className="p-2 rounded-full text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white hover:bg-[#e6e9f6] dark:hover:bg-[#252831] transition-colors relative"
            title="Email Notifications Log"
          >
            <Mail className="w-4 h-4" />
          </Link>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:text-black dark:text-slate-400 dark:hover:text-white hover:bg-[#e6e9f6] dark:hover:bg-[#252831] transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-purple-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="user-menu-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-white dark:bg-[#1c1e24] border border-[#e2e5f0] dark:border-[#2b2e38] hover:border-black dark:hover:border-white transition-all shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-[10px] font-bold text-white dark:text-[#111827]">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-xs font-semibold text-[#111827] dark:text-[#f3f4f6] max-w-[120px] truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#272a33] rounded-2xl overflow-hidden shadow-2xl z-50 p-1.5 text-left"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="px-3 py-2.5 border-b border-[#e2e5f0] dark:border-[#22242a]">
                    <p className="text-xs font-bold text-[#111827] dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role} &bull; {user?.department || 'Campus'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      id="menu-my-profile"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#f8f9fd] dark:hover:bg-[#252831] rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-600" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/ai-assistant');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#f8f9fd] dark:hover:bg-[#252831] rounded-xl transition-colors"
                    >
                      <Bot className="w-4 h-4 text-emerald-600" /> AI Study Copilot
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
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

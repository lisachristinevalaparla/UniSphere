import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Mail, Lock, GraduationCap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter both email and password');
      return;
    }

    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back to UniSphere!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen ambient-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft Ambient Radial Blur Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-3xl pointer-events-none" />

      {/* Glassmorphism Auth Card */}
      <motion.div
        className="glass-panel w-full max-w-md p-8 relative shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">UniSphere</span>
            <span className="badge-info text-[10px]">AI v2</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI-Powered University Super-App</p>
        </div>

        <h1 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-1">Sign In to Workspace</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6">Enter your institutional credentials</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">University Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-email"
                type="email"
                required
                className="input-field pl-10"
                placeholder="student@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2.5 mt-2 shadow-md shadow-indigo-600/20"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

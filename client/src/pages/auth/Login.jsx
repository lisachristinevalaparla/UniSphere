import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowUpRight, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/useThemeStore';
import toast from 'react-hot-toast';
import FloatingControlPill from '../../components/FloatingControlPill';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import SlicedWaves from '../../components/SlicedWaves';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const { isDark } = useThemeStore();
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
    <div className="relative min-h-screen bg-[#f8f9fd] text-[#121212] dark:bg-[#0e0f12] dark:text-[#f3f4f6] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200 overflow-hidden">
      {/* SlicedWaves Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-85 dark:opacity-40">
        <SlicedWaves
          color1={isDark ? '#c084fc' : '#f5dde9'}
          color2={isDark ? '#581c87' : '#d1c1ea'}
          color3={isDark ? '#38bdf8' : '#c4e6ec'}
          columns={14}
          rows={8}
          barThickness={0.1}
          speed={0.35}
          travel={0.7}
          waveSpread={0.9}
          rowOffset={1.0}
          softness={0.05}
          glow={0}
          brightness={1.0}
          contrast={1.0}
          opacity={0.9}
          orientation="horizontal"
          alternate={false}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.3}
          grain={true}
          grainIntensity={0.018}
          lightMode={!isDark}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#111827] dark:text-white">UniSphere</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Auth Card - Wider width with normal compact height & font sizing */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 px-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[640px] bg-white/95 dark:bg-[#18191d]/95 backdrop-blur-xl border border-[#e2e5f0] dark:border-[#272a33] rounded-[2rem] p-6 sm:p-9 shadow-2xl text-left card-depth"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-full bg-[#e6e9f6] dark:bg-[#252831] flex items-center justify-center text-[#111827] dark:text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="badge-chip">Academic Access</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827] dark:text-white mb-2">
            Sign in to workspace.
          </h1>
          <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-6">
            Enter your university credentials or continue with Google to access your dashboard.
          </p>

          {/* Google Sign In Button */}
          <div className="mb-5">
            <GoogleSignInButton onSuccess={() => navigate(from, { replace: true })} />
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-[#e2e5f0] dark:border-[#272a33] w-full" />
            <span className="bg-white dark:bg-[#18191d] px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
              or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">University Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11 rounded-full bg-[#f8f9fd] dark:bg-[#131417] border-[#e2e5f0] dark:border-[#282a32]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-11 rounded-full bg-[#f8f9fd] dark:bg-[#131417] border-[#e2e5f0] dark:border-[#282a32]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="btn-pill-primary w-full py-3.5 text-sm mt-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="text-container">
                  <span className="text">
                    <span>Sign In to UniSphere</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e2e5f0] dark:border-[#22242a] text-center">
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-[#111827] dark:text-white hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center py-4 text-xs text-[#9ca3af]">
        UniSphere Academic Platform &bull; Secure Authentication
      </footer>

      <FloatingControlPill />
    </div>
  );
};

export default Login;

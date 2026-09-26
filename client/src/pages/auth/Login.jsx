import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowUpRight, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/useThemeStore';
import toast from 'react-hot-toast';
import FloatingControlPill from '../../components/FloatingControlPill';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import GradientWaves from '../../components/GradientWaves';

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
      {/* GradientWaves Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GradientWaves
          horizonColor={isDark ? '#3b0764' : '#5227FF'}
          waveColor={isDark ? '#9333ea' : '#FF9FFC'}
          crestColor={isDark ? '#f472b6' : '#FFFFFF'}
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1.0}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1.0}
          opacity={1.0}
          mouseInteraction={true}
          parallaxStrength={0.5}
          grain={true}
          grainIntensity={0.05}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between py-2 sm:py-4">
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

      {/* Auth Card - Same dimensions & styling as Register */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 px-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[490px] bg-white/95 dark:bg-[#18191d]/95 backdrop-blur-xl border border-[#e8ecf4] dark:border-[#272a33] rounded-[2.25rem] p-6 sm:p-9 shadow-[0_20px_50px_rgba(100,100,140,0.12)] dark:shadow-2xl text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-full bg-[#eef4ff] dark:bg-[#252831] flex items-center justify-center text-[#111827] dark:text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1 rounded-full bg-[#eef4ff] dark:bg-[#252831] text-slate-600 dark:text-slate-300 text-xs font-semibold">
              Academic Access
            </span>
          </div>

          <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#111827] dark:text-white mb-1.5">
            Sign in to workspace.
          </h1>
          <p className="text-xs sm:text-[13px] text-[#64748b] dark:text-[#9ca3af] leading-relaxed mb-6">
            Enter your university credentials or continue with Google to access your dashboard.
          </p>

          {/* Google Sign In Button */}
          <div className="mb-5">
            <GoogleSignInButton onSuccess={() => navigate(from, { replace: true })} />
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-[#e8ecf4] dark:border-[#272a33] w-full" />
            <span className="bg-white dark:bg-[#18191d] px-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
              or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl sm:rounded-full bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] block">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 sm:py-3.5 rounded-2xl sm:rounded-full bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] outline-none font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] dark:hover:text-[#e2e8f0]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 sm:py-4 rounded-full bg-[#111827] hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#111827] text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all mt-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white dark:border-black/40 dark:border-t-black rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <span>Sign In to UniSphere</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#e8ecf4] dark:border-[#22242a] text-center">
            <p className="text-xs text-[#64748b] dark:text-[#9ca3af]">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-[#111827] dark:text-white hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center py-3 text-xs text-[#94a3b8]">
        UniSphere Academic Platform &bull; Secure Authentication
      </footer>

      <FloatingControlPill />
    </div>
  );
};

export default Login;

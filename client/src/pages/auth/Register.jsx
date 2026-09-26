import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, ArrowUpRight, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/useThemeStore';
import toast from 'react-hot-toast';
import FloatingControlPill from '../../components/FloatingControlPill';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import GradientWaves from '../../components/GradientWaves';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuthStore();
  const { isDark } = useThemeStore();

  const queryParams = new URLSearchParams(location.search);
  const emailParam = queryParams.get('email') || '';
  const nameParam = queryParams.get('name') || '';
  const roleParam = queryParams.get('role') || 'student';

  const [form, setForm] = useState({
    name: nameParam,
    email: emailParam,
    password: '',
    confirmPassword: '',
    role: roleParam,
    department: 'Computer Science',
    year: '3',
    semester: '6',
    rollNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (emailParam) setForm((f) => ({ ...f, email: emailParam }));
    if (nameParam) setForm((f) => ({ ...f, name: nameParam }));
    if (roleParam) setForm((f) => ({ ...f, role: roleParam }));
  }, [emailParam, nameParam, roleParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      department: form.department,
      year: parseInt(form.year, 10),
      semester: parseInt(form.semester, 10),
      rollNumber: form.rollNumber.trim() || undefined,
    };

    const result = await register(payload);
    if (result.success) {
      toast.success(result.message || 'Welcome to UniSphere! Your account is active.');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.message || 'Registration failed');
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

      {/* Auth Card - Same dimensions & styling as Login */}
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
              Instant Registration
            </span>
          </div>

          <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#111827] dark:text-white mb-1.5">
            Create your account.
          </h1>
          <p className="text-xs sm:text-[13px] text-[#64748b] dark:text-[#9ca3af] leading-relaxed mb-5">
            Get started immediately with Google or your university credentials.
          </p>

          {/* Google Sign In Option */}
          <div className="mb-4">
            <GoogleSignInButton
              role={form.role}
              department={form.department}
              year={form.year}
              semester={form.semester}
              rollNumber={form.rollNumber}
              onSuccess={() => navigate('/dashboard', { replace: true })}
            />
          </div>

          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-[#e8ecf4] dark:border-[#272a33] w-full" />
            <span className="bg-white dark:bg-[#18191d] px-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
              or sign up with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    id="register-name"
                    type="text"
                    required
                    placeholder="Alex Rivers"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-11 pr-3 py-2.5 sm:py-3 rounded-2xl bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder="student@univ.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-11 pr-3 py-2.5 sm:py-3 rounded-2xl bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] outline-none font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Role Toggle */}
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                Role on Campus
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'student' })}
                  className={`py-2 px-3 rounded-full text-xs font-bold border transition-all ${
                    form.role === 'student'
                      ? 'bg-[#111827] text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                      : 'bg-[#eef4ff] dark:bg-[#141518] text-slate-700 dark:text-slate-300 border-transparent hover:border-[#cbd5e1]'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'faculty' })}
                  className={`py-2 px-3 rounded-full text-xs font-bold border transition-all ${
                    form.role === 'faculty'
                      ? 'bg-[#111827] text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                      : 'bg-[#eef4ff] dark:bg-[#141518] text-slate-700 dark:text-slate-300 border-transparent hover:border-[#cbd5e1]'
                  }`}
                >
                  Faculty / Admin
                </button>
              </div>
            </div>

            {/* Student specific fields */}
            {form.role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-xs text-[#0f172a] dark:text-white outline-none font-medium transition-all"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Tech">Information Tech</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Mechanical Eng">Mechanical Eng</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                    Semester
                  </label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-xs text-[#0f172a] dark:text-white outline-none font-medium transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-11 pr-3 py-2.5 sm:py-3 rounded-2xl bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] block">
                    Confirm
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#94a3b8] hover:text-[#475569] dark:hover:text-white"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-3 py-2.5 sm:py-3 rounded-2xl bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] outline-none font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 sm:py-4 rounded-full bg-[#111827] hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#111827] text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all mt-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white dark:border-black/40 dark:border-t-black rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <span>Create Account & Enter</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#e8ecf4] dark:border-[#22242a] text-center">
            <p className="text-xs text-[#64748b] dark:text-[#9ca3af]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#111827] dark:text-white hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center py-3 text-xs text-[#94a3b8]">
        UniSphere Academic Platform &bull; Instant Access Flow
      </footer>

      <FloatingControlPill />
    </div>
  );
};

export default Register;

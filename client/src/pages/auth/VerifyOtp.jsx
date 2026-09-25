import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowUpRight, Mail, KeyRound, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/useThemeStore';
import FloatingControlPill from '../../components/FloatingControlPill';
import SlicedWaves from '../../components/SlicedWaves';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();
  const { isDark } = useThemeStore();

  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);

  // 60-second cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    const res = await verifyOtp(email, otp);
    if (res.success) {
      toast.success('Email verified successfully! Welcome to UniSphere.');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(res.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    if (!email) {
      toast.error('Email is required to resend code');
      return;
    }

    setIsResending(true);
    const res = await resendOtp(email);
    setIsResending(false);

    if (res.success) {
      toast.success('A new 6-digit verification code has been sent to your email.');
      setCooldown(60);
    } else {
      toast.error(res.message || 'Failed to resend verification code');
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

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] shadow-md transition-transform group-hover:scale-105">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#111827] dark:text-white">UniSphere</span>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-[#e2e5f0] dark:border-white/10 text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition-all shadow-sm hover:shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Form Container - Enlarged & Polished */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-10 px-2">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[640px] bg-white/95 dark:bg-[#18191d]/95 backdrop-blur-xl border border-[#e2e5f0] dark:border-[#272a33] rounded-[2rem] p-6 sm:p-9 shadow-2xl text-left card-depth"
        >
          {/* Badge & Icon */}
          <div className="flex items-center justify-between mb-7">
            <div className="w-13 h-13 p-3 rounded-2xl bg-[#e6e9f6] dark:bg-[#252831] flex items-center justify-center text-[#111827] dark:text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="badge-chip text-xs px-3.5 py-1 font-bold">Email Verification</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827] dark:text-white mb-2.5">
            Enter security code.
          </h1>
          <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-7">
            We’ve sent a 6-digit verification code to{' '}
            <strong className="text-[#111827] dark:text-white">{email || 'your email'}</strong>. Enter it below to activate your university workspace.
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            {!emailFromQuery && (
              <div>
                <label className="label text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">University Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11 py-3 sm:py-3.5 text-sm rounded-2xl bg-[#f8f9fd] dark:bg-[#131417] border-[#e2e5f0] dark:border-[#282a32]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 block">6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-field pl-11 py-3 sm:py-3.5 tracking-widest text-base sm:text-lg font-bold font-mono rounded-2xl bg-[#f8f9fd] dark:bg-[#131417] border-[#e2e5f0] dark:border-[#282a32]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="btn-pill-primary w-full py-4 text-sm sm:text-base font-bold mt-3 shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="text-container">
                  <span className="text flex items-center justify-center gap-2">
                    <span>Verify & Enter Workspace</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </span>
              )}
            </button>
          </form>

          {/* Resend Cooldown */}
          <div className="mt-7 pt-6 border-t border-[#e2e5f0] dark:border-[#22242a] flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#6b7280] dark:text-[#9ca3af]">Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="font-bold text-[#111827] dark:text-white hover:underline disabled:opacity-40 disabled:no-underline inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code now'}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center py-4 text-xs text-slate-400">
        UniSphere Academic &bull; Secure Email Verification &bull; Single-use token
      </footer>

      <FloatingControlPill />
    </div>
  );
};

export default VerifyOtp;

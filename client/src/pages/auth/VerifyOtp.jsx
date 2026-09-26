import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowUpRight, Mail, KeyRound, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/useThemeStore';
import FloatingControlPill from '../../components/FloatingControlPill';
import GradientWaves from '../../components/GradientWaves';

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

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between py-2 sm:py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827] shadow-sm">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#111827] dark:text-white">UniSphere</span>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4b5563] dark:text-[#9ca3af] hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Form Container - Same dimensions as Login and Register */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6 px-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[490px] bg-white/95 dark:bg-[#18191d]/95 backdrop-blur-xl border border-[#e8ecf4] dark:border-[#272a33] rounded-[2.25rem] p-6 sm:p-9 shadow-[0_20px_50px_rgba(100,100,140,0.12)] dark:shadow-2xl text-left"
        >
          {/* Badge & Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-full bg-[#eef4ff] dark:bg-[#252831] flex items-center justify-center text-[#111827] dark:text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="px-3.5 py-1 rounded-full bg-[#eef4ff] dark:bg-[#252831] text-slate-600 dark:text-slate-300 text-xs font-semibold">
              Email Verification
            </span>
          </div>

          <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#111827] dark:text-white mb-1.5">
            Enter security code.
          </h1>
          <p className="text-xs sm:text-[13px] text-[#64748b] dark:text-[#9ca3af] leading-relaxed mb-6">
            We’ve sent a 6-digit verification code to{' '}
            <strong className="text-[#111827] dark:text-white">{email || 'your email'}</strong>. Enter it below to activate your university workspace.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            {!emailFromQuery && (
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-2xl sm:rounded-full bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] outline-none font-medium transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] mb-1.5 block">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 tracking-widest text-base font-bold font-mono rounded-2xl sm:rounded-full bg-[#eef4ff] dark:bg-[#131417] border border-transparent focus:border-[#93c5fd] dark:focus:border-[#6366f1] text-[#0f172a] dark:text-white placeholder-[#94a3b8] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full py-3.5 sm:py-4 rounded-full bg-[#111827] hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#111827] text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all mt-3 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white dark:border-black/40 dark:border-t-black rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <span>Verify & Enter Workspace</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Resend Cooldown */}
          <div className="mt-6 pt-5 border-t border-[#e8ecf4] dark:border-[#22242a] flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#64748b] dark:text-[#9ca3af]">Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="font-bold text-[#111827] dark:text-white hover:underline disabled:opacity-40 disabled:no-underline inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend code now'}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center py-3 text-xs text-[#94a3b8]">
        UniSphere Academic &bull; Secure Email Verification &bull; Single-use token
      </footer>

      <FloatingControlPill />
    </div>
  );
};

export default VerifyOtp;

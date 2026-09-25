import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  GraduationCap,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Bot,
  Calendar,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Users,
  Shield,
  Clock,
  ArrowRight,
  FileText,
  TrendingUp,
  MessageSquare,
  Award,
  Menu,
  X,
  Home,
  Layers,
  UserCheck,
  HelpCircle,
} from 'lucide-react';
import FloatingControlPill from '../components/FloatingControlPill';
import Hero3DCarousel from '../components/Hero3DCarousel';
import SnappyReticle from '../components/SnappyReticle';
import TextReveal3D from '../components/TextReveal3D';
import TechText from '../components/TechText';
import Grainient from '../components/Grainient';
import Scanner from '../components/Scanner';
import LightRays from '../components/LightRays';
import Dock from '../components/Dock';
import useThemeStore from '../store/useThemeStore';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark } = useThemeStore();
  const [heroEmail, setHeroEmail] = useState('');
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'faculty'
  const [activeFaq, setActiveFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero Headline 3D Parallax Tilt (Smooth subtle 6-8deg range)
  const heroRef = useRef(null);
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const heroSpring = { damping: 22, stiffness: 120, mass: 0.15 };
  const heroRotateX = useSpring(useTransform(heroMouseY, [-0.5, 0.5], [7, -7]), heroSpring);
  const heroRotateY = useSpring(useTransform(heroMouseX, [-0.5, 0.5], [-8, 8]), heroSpring);

  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroMouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    heroMouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleHeroMouseLeave = () => {
    heroMouseX.set(0);
    heroMouseY.set(0);
  };

  const dockNavItems = [
    {
      icon: <Home className="w-4 h-4 text-[#111827] dark:text-[#f3f4f6]" />,
      label: 'Why UniSphere',
      onClick: () => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      icon: <Layers className="w-4 h-4 text-[#111827] dark:text-[#f3f4f6]" />,
      label: 'Features',
      onClick: () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      icon: <Sparkles className="w-4 h-4 text-purple-500 fill-purple-500/20" />,
      label: 'AI Assistant',
      onClick: () => {
        document.getElementById('ai-assistant')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      icon: <UserCheck className="w-4 h-4 text-[#111827] dark:text-[#f3f4f6]" />,
      label: 'For Institutions',
      onClick: () => {
        document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      icon: <HelpCircle className="w-4 h-4 text-[#111827] dark:text-[#f3f4f6]" />,
      label: 'FAQ',
      onClick: () => {
        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  // Quick interactive AI demo question selector
  const [aiDemoIndex, setAiDemoIndex] = useState(0);

  // Signup form state on the bottom section
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
  });

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    navigate(`/register${heroEmail ? `?email=${encodeURIComponent(heroEmail)}` : ''}`);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const fullName = `${signupForm.firstName} ${signupForm.lastName}`.trim();
    navigate(
      `/register?email=${encodeURIComponent(signupForm.email)}&name=${encodeURIComponent(fullName)}&role=${signupForm.role}`
    );
  };

  const audienceRoles = [
    { name: 'Engineering Students', icon: '💻', count: '1.2k active' },
    { name: 'Faculty & Mentors', icon: '👨‍🏫', count: '180 professors' },
    { name: 'Placement Cell', icon: '💼', count: '45 drives open' },
    { name: 'Club Organizers', icon: '🎨', count: '28 active clubs' },
    { name: 'Research Scholars', icon: '🔬', count: '320 papers' },
    { name: 'Event Coordinators', icon: '🎪', count: '12 upcoming' },
    { name: 'Hostel Residents', icon: '🏢', count: '850 residents' },
    { name: 'Department Heads', icon: '🏛️', count: '14 branches' },
  ];

  const aiMockExchanges = [
    {
      question: 'What should I prioritize for this week?',
      answer:
        'You have CS401 Lab Assignment due Thursday at 11:59 PM. Also, your Data Mining attendance is currently 72% — attending tomorrow’s 9 AM lecture will safely bring you above the 75% requirement.',
      tags: ['CS401 Lab Due', 'Attendance 72% ⚠️', 'Exam in 12d'],
    },
    {
      question: 'Summarize Unit 4 Concurrency notes for my quiz',
      answer:
        'Unit 4 covers Mutex locks, Semaphores, Deadlock Avoidance (Banker\'s Algorithm), and Monitor constructs. 4 past exam questions are mapped directly to this chapter.',
      tags: ['Unit 4 Summary', '4 Solved Midterms', 'Flashcards Ready'],
    },
    {
      question: 'Am I eligible for the Google and Microsoft placement drives?',
      answer:
        'Yes! Your CGPA is 8.8 (cutoff is 7.5) with 0 active backlogs. Google coding round starts Saturday at 10:00 AM. Would you like a 10-question DSA mock quiz?',
      tags: ['Eligible (8.8 CGPA)', 'DSA Quiz Ready', 'Saturday 10 AM'],
    },
  ];

  const faqs = [
    {
      q: 'Is my academic data private and secure?',
      a: 'Yes. UniSphere uses end-to-end encryption, strict role-based access control (RBAC), and never shares or sells student personal records, marks, or attendance logs to third parties.',
    },
    {
      q: 'Can faculty or administrators view my personal AI assistant chats?',
      a: 'No. Your conversations with the AI study assistant are completely private to your account. Faculty and admins can only view public coursework submissions and aggregate class metrics.',
    },
    {
      q: 'Do I need to install anything to use UniSphere?',
      a: 'Not at all. UniSphere runs seamlessly in any modern web browser across laptops, tablets, and smartphones, with real-time cloud synchronization.',
    },
    {
      q: 'How is my attendance calculated and monitored?',
      a: 'Attendance is dynamically aggregated per subject based on attended versus total conducted lectures. When your attendance drops below 75%, UniSphere automatically sends automated warnings.',
    },
    {
      q: 'How do automated alerts work?',
      a: 'UniSphere delivers instant automated email notifications for upcoming assignment deadlines, verified notes uploads, exam schedules, and placement interview calls.',
    },
  ];

  return (
    <div id="top" className="relative min-h-screen bg-[#f8f9fd] text-[#121212] dark:bg-[#111215] dark:text-[#f3f4f6] transition-colors duration-200 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* 0. AMBIENT BLENDED BACKGROUND (Subtle 22s CSS color drift) */}
      <div className="animated-ambient-bg" />

      {/* 0.1 CONSTANT LIGHT RAYS AMBIENT BEAM (Fixed background across landing page even when scrolling) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-85 dark:opacity-70 transition-opacity duration-300">
        <LightRays
          raysOrigin="top-center"
          raysColor={isDark ? "#8b5cf6" : "#6d28d9"}
          raysSpeed={1.2}
          lightSpread={0.45}
          rayLength={2.2}
          pulsating={false}
          followMouse={true}
          mouseInfluence={0.08}
          noiseAmount={0.06}
          distortion={0.04}
          saturation={0.8}
          lightMode={!isDark}
        />
      </div>

      {/* 1. FIXED TOP NAVBAR WITH POPPED RAISED PILL ITEMS (76-80px Spacious Height) */}
      <header className="sticky top-0 z-50 w-full bg-[#111215]/95 backdrop-blur-md border-b border-[#26282e]/80 text-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo / Brand on Far Left */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#111827] shadow-md transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              UniSphere
            </span>
          </Link>

          {/* Center: Popped Raised Nav Pills (Icon + Label Together) */}
          <nav className="hidden md:flex items-center gap-2.5 lg:gap-3.5">
            {/* 🏠 Why UniSphere */}
            <a
              href="#how-it-works"
              className="nav-popped-pill group"
            >
              <Home className="w-4 h-4 text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              <span>Why UniSphere</span>
            </a>

            {/* 📚 Features */}
            <a
              href="#features"
              className="nav-popped-pill group"
            >
              <Layers className="w-4 h-4 text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              <span>Features</span>
            </a>

            {/* ✨ AI Assistant */}
            <a
              href="#ai-assistant"
              className="nav-popped-pill group"
            >
              <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400/20 group-hover:scale-110 transition-transform" />
              <span>AI Assistant</span>
            </a>

            {/* 🧑 For Institutions */}
            <a
              href="#roles"
              className="nav-popped-pill group"
            >
              <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              <span>For Institutions</span>
            </a>

            {/* ❓ FAQ */}
            <a
              href="#faq"
              className="nav-popped-pill group"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              <span>FAQ</span>
            </a>
          </nav>

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-3.5 shrink-0">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link to="/register" className="btn-pill-primary text-xs py-2.5 px-5 bg-white text-[#111827]">
              <span className="text-container">
                <span className="text">
                  <span>Get Started</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu with Icons + Labels */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-[#26282e] bg-[#111215] px-4 py-4 space-y-2.5 text-sm font-semibold"
            >
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Why UniSphere</span>
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Features</span>
              </a>
              <a
                href="#ai-assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Assistant</span>
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
              >
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>For Institutions</span>
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>FAQ</span>
              </a>
              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-pill-primary text-xs py-2.5 text-center bg-white text-[#111827]"
                >
                  <span className="text-container">
                    <span className="text">
                      <span>Get Started</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION WITH STAGGERED ENTRANCE & AMBIENT GLOW BLOBS */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative z-10 pt-12 sm:pt-20 pb-16 max-w-6xl mx-auto px-4 sm:px-6"
      >
        {/* Soft Ambient Blurred Gradient Blobs behind Hero */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-violet-500/20 dark:bg-violet-600/25 blur-[95px] animate-[ambientBlobDrift_20s_ease-in-out_infinite_alternate]" />
          <div className="absolute top-10 right-1/4 w-96 h-96 rounded-full bg-purple-500/18 dark:bg-purple-600/22 blur-[105px] animate-[ambientBlobDrift_24s_ease-in-out_infinite_alternate_reverse]" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-emerald-500/15 dark:bg-teal-500/18 blur-[85px] animate-[ambientBlobDrift_16s_ease-in-out_infinite_alternate]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography Dominant with Interactive 3D Cursor Tilt */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* 0ms Delay: Rounded Pill Badge Chip */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-[#374151] dark:text-[#d1d5db] border border-[#dadff0] dark:border-[#2b2e38] mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>🎓 One workspace for your whole campus</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </motion.div>

            {/* 100ms Delay: TechText Interactive Vector Headline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="w-full max-w-xl mb-4 select-none"
            >
              <div className="w-full h-12 sm:h-14 md:h-16 relative">
                <TechText
                  text="Attend. Submit."
                  fontWeight={900}
                  fontSize={48}
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={15}
                  selection={true}
                  labels={true}
                  draggable={true}
                  sweep={false}
                  color={isDark ? '#ffffff' : '#111827'}
                  accentColor={isDark ? '#8b5cf6' : '#111827'}
                />
              </div>
              <div className="w-full h-12 sm:h-14 md:h-16 relative">
                <TechText
                  text="Prepare."
                  fontWeight={900}
                  fontSize={48}
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={15}
                  selection={true}
                  labels={true}
                  draggable={true}
                  sweep={false}
                  color={isDark ? '#ffffff' : '#111827'}
                  accentColor={isDark ? '#8b5cf6' : '#111827'}
                />
              </div>
              <div className="w-full h-12 sm:h-14 md:h-16 relative">
                <TechText
                  text="Everything, together."
                  fontWeight={800}
                  fontSize={40}
                  reveal="letter"
                  dashLength={4}
                  dashGap={2}
                  specks={12}
                  selection={true}
                  labels={true}
                  draggable={true}
                  sweep={false}
                  color={isDark ? '#94a3b8' : '#64748b'}
                  accentColor={isDark ? '#8b5cf6' : '#475569'}
                />
              </div>
            </motion.div>

            {/* 200ms Delay: Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-base sm:text-lg text-[#4b5563] dark:text-[#a1a1aa] leading-relaxed mb-8 max-w-lg"
            >
              Unifying attendance tracking, assignment workflows, exam schedules, course materials, campus events, and placement drives with an intelligent AI copilot.
            </motion.p>

            {/* 300ms Delay: Email Input + Pill CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="w-full max-w-md"
            >
              <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row gap-2.5 mb-3">
                <input
                  type="email"
                  required
                  placeholder="Your university email..."
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  className="input-pill flex-1 text-sm bg-white dark:bg-[#18191d]"
                />
                <button type="submit" className="btn-pill-primary whitespace-nowrap text-sm">
                  <span className="text-container">
                    <span className="text">
                      <span>Start Exploring</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </span>
                </button>
              </form>

              <p className="text-xs text-[#6b7280] dark:text-[#71717a] mb-8">
                Instant access for students & faculty. Sign in with Google or institutional email.
              </p>

              {/* Social Proof Pill Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#f0f2fa] dark:bg-[#181a20] border border-[#e2e5f0] dark:border-[#272a33]">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
                    alt="Student avatar"
                    className="w-6 h-6 rounded-full border border-white dark:border-[#18191d] object-cover grayscale"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces"
                    alt="Student avatar"
                    className="w-6 h-6 rounded-full border border-white dark:border-[#18191d] object-cover grayscale"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces"
                    alt="Student avatar"
                    className="w-6 h-6 rounded-full border border-white dark:border-[#18191d] object-cover grayscale"
                  />
                </div>
                <span className="text-xs font-medium text-[#374151] dark:text-[#d1d5db]">
                  <strong className="font-semibold text-[#111827] dark:text-white">For the way you study.</strong> Solo, or together.
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Swipeable Photo Carousel */}
          <div className="lg:col-span-6 relative">
            <Hero3DCarousel />
          </div>
        </div>
      </section>

      {/* 3. SCROLLING AUDIENCE / USE-CASE ROW (Dual-Row Infinite Marquee with Thumbnails and Snappy Reticles) */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 py-14 border-y border-[#e2e5f0] dark:border-[#26282e] bg-[#f0f2fa] dark:bg-[#141518] overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">
            For every campus role.
          </h2>
        </div>

        {/* Row 1: Leftward Marquee with Snappy Reticle and Pop Out */}
        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] mb-4">
          {[...audienceRoles, ...audienceRoles].map((role, idx) => (
            <SnappyReticle key={`row1-${idx}`} className="inline-block" enableClickPop={true}>
              <div className="card-popout inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#1c1e24] border border-[#dadff0] dark:border-[#2b2e38] text-xs font-semibold text-[#111827] dark:text-white cursor-pointer select-none">
                <div className="w-8 h-8 rounded-xl bg-[#e6e9f6] dark:bg-[#272a33] flex items-center justify-center text-sm shadow-inner">
                  {role.icon}
                </div>
                <div className="text-left">
                  <span className="block font-bold leading-tight">{role.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{role.count}</span>
                </div>
              </div>
            </SnappyReticle>
          ))}
        </div>

        {/* Row 2: Staggered Reverse Marquee */}
        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee-slow hover:[animation-play-state:paused]">
          {[...audienceRoles.slice().reverse(), ...audienceRoles.slice().reverse()].map((role, idx) => (
            <SnappyReticle key={`row2-${idx}`} className="inline-block" enableClickPop={true}>
              <div className="card-popout inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#1c1e24] border border-[#dadff0] dark:border-[#2b2e38] text-xs font-semibold text-[#111827] dark:text-white cursor-pointer select-none">
                <div className="w-8 h-8 rounded-xl bg-[#e6e9f6] dark:bg-[#272a33] flex items-center justify-center text-sm shadow-inner">
                  {role.icon}
                </div>
                <div className="text-left">
                  <span className="block font-bold leading-tight">{role.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{role.count}</span>
                </div>
              </div>
            </SnappyReticle>
          ))}
        </div>
      </motion.section>

      {/* 4. SECTION — "EVERYTHING BELONGS IN ONE PLACE" (Tabbed Sub-section with Crossfade) */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 py-20 max-w-6xl mx-auto px-4 sm:px-6 text-center"
      >
        <div className="max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white mb-4">
            Everything belongs in one place.
          </h2>
          <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
            From the first lecture notes to exam prep and campus placement drives, UniSphere provides a unified workspace.
          </p>
        </div>

        {/* Tabbed Segmented Pill Toggle */}
        <div className="mb-12 inline-block">
          <div className="segmented-pill-container">
            <button
              onClick={() => setActiveTab('students')}
              className={`segmented-pill-item ${
                activeTab === 'students' ? 'segmented-pill-item-active' : ''
              }`}
            >
              For Students
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`segmented-pill-item ${
                activeTab === 'faculty' ? 'segmented-pill-item-active' : ''
              }`}
            >
              For Faculty & Admins
            </button>
          </div>
        </div>

        {/* Dynamic Tab Content Cards with Crossfade */}
        <AnimatePresence mode="wait">
          {activeTab === 'students' ? (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
            >
              <SnappyReticle enableClickPop={true} className="w-full h-full">
                <div className="uiverse-glow-card h-full">
                  <div className="uiverse-glow-inner bg-[#f8fafd] dark:bg-[#14161c] p-6 sm:p-8 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white mb-2">
                        One canvas. More possibilities.
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#a1a1aa] mb-6">
                        Bring everyone's references, syllabus notes, and lab assignments into one shared, frictionless workspace.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1c22] border border-[#e2e5f0] dark:border-[#2c303a] rounded-2xl p-5 shadow-sm mt-auto">
                      <div className="flex items-center justify-between text-xs font-semibold mb-3">
                        <span className="text-slate-500">Subject Overview</span>
                        <span className="badge-success text-[10px]">88% Attendance</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-[#f8f9fd] dark:bg-[#141518] flex items-center justify-between text-xs">
                          <span className="font-medium text-[#111827] dark:text-white">CS401: Distributed Systems</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">28/30 attended</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#f8f9fd] dark:bg-[#141518] flex items-center justify-between text-xs">
                          <span className="font-medium text-[#111827] dark:text-white">CS402: Neural Networks Lab</span>
                          <span className="text-slate-500 font-medium">Due in 2 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SnappyReticle>

              <SnappyReticle enableClickPop={true} className="w-full h-full">
                <div className="uiverse-glow-card h-full">
                  <div className="uiverse-glow-inner bg-[#fbf8fe] dark:bg-[#17151f] p-6 sm:p-8 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white mb-2">
                        Less passing files around.
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#a1a1aa] mb-6">
                        A single place to download verified course notes, submit PDFs, and receive instant faculty feedback.
                      </p>
                    </div>

                    <div className="bg-white dark:bg-[#1a1c22] border border-[#e2e5f0] dark:border-[#2c303a] rounded-2xl p-5 shadow-sm mt-auto">
                      <div className="flex items-center justify-between text-xs font-semibold mb-3">
                        <span className="text-slate-500">Verified Study Material</span>
                        <span className="badge-info text-[10px]">Unit 4 Notes</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#f8f9fd] dark:bg-[#141518] flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[#111827] dark:text-white" />
                        <div>
                          <div className="text-xs font-bold text-[#111827] dark:text-white">
                            Operating_Systems_Concurrency.pdf
                          </div>
                          <div className="text-[10px] text-slate-500">Uploaded by Prof. Nair &bull; 4.2 MB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SnappyReticle>
            </motion.div>
          ) : (
            <motion.div
              key="faculty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
            >
              <SnappyReticle enableClickPop={true} className="w-full h-full">
                <div className="uiverse-glow-card h-full">
                  <div className="uiverse-glow-inner bg-[#f8fafd] dark:bg-[#14161c] p-6 sm:p-8 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white mb-2">
                        Keep the feedback in the frame.
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#a1a1aa] mb-6">
                        Review student submissions, mark attendance in two clicks, and broadcast course announcements directly to emails.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#1a1c22] border border-[#e2e5f0] dark:border-[#2c303a] rounded-2xl p-5 mt-auto">
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-500">Batch Attendance Entry</span>
                        <span className="text-emerald-600 font-bold">48/52 Present</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </SnappyReticle>

              <SnappyReticle enableClickPop={true} className="w-full h-full">
                <div className="uiverse-glow-card h-full">
                  <div className="uiverse-glow-inner bg-[#fbf8fe] dark:bg-[#17151f] p-6 sm:p-8 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-white mb-2">
                        Every semester has a story.
                      </h3>
                      <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#a1a1aa] mb-6">
                        Track pass rates, identify students needing attendance support, and organize campus placements with clear audit logs.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#1a1c22] border border-[#e2e5f0] dark:border-[#2c303a] rounded-2xl p-5 mt-auto">
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-500">Course Progression</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">Week 11 of 14</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#111827] dark:bg-white rounded-full w-[78%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </SnappyReticle>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* 5. ALTERNATING TWO-COLUMN FEATURE SECTIONS */}
      <section id="features" className="relative z-10 py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-24">
        {/* Feature 1: Attendance & Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-5 text-left">
            <span className="badge-chip mb-4">Module 01</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white mb-4 leading-tight">
              Keep the feedback in the frame.
            </h3>
            <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-6">
              Turn a trail of messages into clear, actionable progress on real university coursework. Track your 75% attendance threshold with automated warnings.
            </p>
            <Link
              to="/attendance"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-white hover:underline underline-offset-4"
            >
              <span>Explore attendance & coursework</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <SnappyReticle enableClickPop={true} className="w-full">
              <div className="relative rounded-3xl overflow-hidden border border-[#e2e5f0] dark:border-[#26282e] bg-[#f0fdf4] dark:bg-[#161a17] p-8 sm:p-12">
                <div className="uiverse-glow-card max-w-md mx-auto relative">
                  <div className="uiverse-glow-inner bg-white dark:bg-[#18191d] p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          82%
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#111827] dark:text-white">Semester Attendance</div>
                          <div className="text-[10px] text-slate-500">Above 75% threshold</div>
                        </div>
                      </div>
                      <span className="badge-success text-[10px]">On Track</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Data Structures & Algos</span>
                        <span className="font-semibold text-emerald-600">92%</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400">Database Management</span>
                        <span className="font-semibold text-emerald-600">85%</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-600 dark:text-slate-400">Machine Learning</span>
                        <span className="font-semibold text-purple-600">76% (Attend next lecture)</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Activity Card */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="absolute -bottom-6 -right-4 sm:-right-6 activity-bubble-card max-w-[240px] z-20"
                  >
                    <div className="text-[10px] text-slate-500 mb-1">Live automated alert</div>
                    <div className="text-xs font-semibold text-[#111827] dark:text-white mb-2">
                      Attendance: 82% — on track
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Minimum quota maintained
                    </div>
                  </motion.div>
                </div>
              </div>
            </SnappyReticle>
          </div>
        </motion.div>

        {/* Feature 2: Exams & Course Materials */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-7 order-2 lg:order-1">
            <SnappyReticle enableClickPop={true} className="w-full">
              <div className="relative rounded-3xl overflow-hidden border border-[#e2e5f0] dark:border-[#26282e] bg-[#faf5ff] dark:bg-[#1a1814] p-8 sm:p-12">
                <div className="uiverse-glow-card max-w-md mx-auto relative">
                  <div className="uiverse-glow-inner bg-white dark:bg-[#18191d] p-6">
                    <div className="flex items-center justify-between text-xs font-bold mb-4">
                      <span className="text-[#111827] dark:text-white">Upcoming Midterm Roadmap</span>
                      <span className="badge-info text-[10px]">Oct 14 - Oct 22</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#f8f9fd] dark:bg-[#141518] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#111827] dark:text-white">CS301: Algorithms Exam</div>
                          <div className="text-[10px] text-slate-500">Hall 304 &bull; 10:00 AM - 1:00 PM</div>
                        </div>
                        <span className="badge-neutral text-[10px]">In 4 Days</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#f8f9fd] dark:bg-[#141518] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#111827] dark:text-white">Unit 4 Solved Question Bank</div>
                          <div className="text-[10px] text-slate-500">Verified by Prof. Sharma</div>
                        </div>
                        <span className="text-emerald-600 font-semibold text-[10px]">PDF Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Activity Card */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="absolute -bottom-6 -left-4 sm:-left-6 activity-bubble-card max-w-[240px] z-20"
                  >
                    <div className="text-[10px] text-slate-500 mb-1">Course Material Upload</div>
                    <div className="text-xs font-semibold text-[#111827] dark:text-white mb-2">
                      New material uploaded: Unit 4 notes
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Emailed to class
                    </div>
                  </motion.div>
                </div>
              </div>
            </SnappyReticle>
          </div>

          <div className="lg:col-span-5 text-left order-1 lg:order-2">
            <span className="badge-chip mb-4">Module 02</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white mb-4 leading-tight">
              Every version has a story.
            </h3>
            <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-6">
              See how the syllabus unfolds, revisit past year question papers, and prepare for exams with confidence. Everything mapped to your academic calendar.
            </p>
            <Link
              to="/exams"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-white hover:underline underline-offset-4"
            >
              <span>Explore exams & materials</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Feature 3: Events, Clubs & Placements */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
        >
          <div className="lg:col-span-5 text-left">
            <span className="badge-chip mb-4">Module 03</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white mb-4 leading-tight">
              Stay ahead of campus life.
            </h3>
            <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-6">
              From annual hackathons and cultural clubs to tier-1 company placement drives, receive instant alerts and register with one click.
            </p>
            <Link
              to="/placements"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-white hover:underline underline-offset-4"
            >
              <span>Explore placements & events</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <SnappyReticle enableClickPop={true} className="w-full">
              <div className="relative rounded-3xl overflow-hidden border border-[#e2e5f0] dark:border-[#26282e] bg-[#f5f3ff] dark:bg-[#15191e] p-8 sm:p-12">
                <div className="uiverse-glow-card max-w-md mx-auto relative">
                  <div className="uiverse-glow-inner bg-white dark:bg-[#18191d] p-6">
                  <div className="flex items-center justify-between text-xs font-bold mb-4">
                    <span className="text-[#111827] dark:text-white">Active Placement Drives</span>
                    <span className="badge-info text-[10px]">3 Drives Open</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#f8f9fd] dark:bg-[#141518] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#111827] dark:text-white">Google Software Engineering</div>
                        <div className="text-[10px] text-slate-500">Package: 24 LPA &bull; Eligibility: 7.5+ CGPA</div>
                      </div>
                      <span className="btn-pill-sm text-[10px] py-1 px-3">Applied</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f8f9fd] dark:bg-[#141518] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#111827] dark:text-white">Annual Campus Hackathon</div>
                        <div className="text-[10px] text-slate-500">Organized by Coding Club &bull; 36 Hours</div>
                      </div>
                      <span className="badge-success text-[10px]">Registered</span>
                    </div>
                  </div>
                  </div>

                  {/* Floating Activity Card */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="absolute -bottom-6 -right-4 sm:-right-6 activity-bubble-card max-w-[240px] z-20"
                  >
                    <div className="text-[10px] text-slate-500 mb-1">Campus Placement Drive</div>
                    <div className="text-xs font-semibold text-[#111827] dark:text-white mb-2">
                      3 new placement drives posted
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Profile eligible
                    </div>
                  </motion.div>
                </div>
              </div>
            </SnappyReticle>
          </div>
        </motion.div>

        {/* Feature 4: AI ASSISTANT SPOTLIGHT (Centerpiece Showcase with Scanner Signal Field Background) */}
        <motion.div
          id="ai-assistant"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative rounded-4xl overflow-hidden border border-[#2b1848] dark:border-[#3d1f66] bg-[#090514] text-white p-8 sm:p-14 shadow-2xl"
        >
          {/* Scanner WebGL Signal Field Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Scanner
              color1="#5227FF"
              color2="#FF9FFC"
              color3="#FFFFFF"
              speed={0.45}
              sweepSpeed={0.22}
              sweepWidth={1.6}
              sweepFalloff={6}
              scale={1.4}
              frequency={2}
              ripple={0.25}
              bandDensity={12}
              lineSharpness={5.5}
              glow={0.25}
              scanDirection="horizontal"
              colorSpread={0.7}
              brightness={1.0}
              contrast={1.2}
              softness={1.4}
              vignette={0.5}
              scanline={true}
              grain={true}
              grainIntensity={0.06}
              opacity={0.85}
              mouseInteraction={true}
              mouseRadius={0.55}
              mouseStrength={0.5}
            />
            {/* Subtle darkening vignette overlay so text & chat cards remain ultra-sharp */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 mb-4 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Campus Academic Copilot</span>
            </div>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Less getting in the way. <br />
              <span className="text-purple-200">More getting carried away.</span>
            </h3>
            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed max-w-xl mx-auto font-medium">
              Your 24/7 personal AI copilot trained on your exact university syllabus, pending assignments, and attendance logs.
            </p>
          </div>

          {/* Interactive AI Showcase Box */}
          <div className="card-popout relative z-10 max-w-2xl mx-auto bg-black/45 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 text-left shadow-2xl">
            {/* Quick Demo Prompts */}
            <div className="flex flex-wrap gap-2 mb-6">
              {aiMockExchanges.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setAiDemoIndex(i)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    aiDemoIndex === i
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  "{ex.question.slice(0, 32)}..."
                </button>
              ))}
            </div>

            {/* Conversation Flow */}
            <div className="space-y-4 text-xs sm:text-sm mb-6">
              {/* User Bubble */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-white/15 text-white p-3.5 rounded-2xl rounded-tr-sm max-w-md border border-white/10">
                  {aiMockExchanges[aiDemoIndex].question}
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  You
                </div>
              </div>

              {/* AI Response Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white/10 text-slate-100 p-4 rounded-2xl rounded-tl-sm max-w-lg border border-white/15 leading-relaxed">
                  <p className="mb-3">{aiMockExchanges[aiDemoIndex].answer}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiMockExchanges[aiDemoIndex].tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Powered by Groq Llama 3 & Claude AI</span>
              <Link to="/ai-assistant" className="btn-pill-primary text-xs py-2 px-4 bg-white text-black hover:bg-slate-200">
                <span className="text-container">
                  <span className="text">
                    <span>Try Copilot in App</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5.1 TRUE 3D PERSPECTIVE FLIP STATEMENT ANIMATION */}
      <TextReveal3D
        words={['THE', 'ENTIRE', 'CAMPUS', 'FINALLY', 'TOGETHER']}
        subtext="One unified workspace connecting students, faculty, coursework, and placements."
      />

      {/* 6. SIMPLE TWO-TIER COMPARISON SECTION */}
      <motion.section
        id="roles"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 py-20 max-w-6xl mx-auto px-4 sm:px-6 text-center"
      >
        <div className="max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white mb-3">
            One platform. Dedicated roles.
          </h2>
          <p className="text-sm text-[#4b5563] dark:text-[#9ca3af]">
            UniSphere is free and open for your entire university ecosystem. Choose your portal to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          {/* Card 1: Student */}
          <SnappyReticle enableClickPop={true} className="w-full h-full">
            <div className="uiverse-glow-card h-full">
              <div className="uiverse-glow-inner flex flex-col justify-between border-2 border-[#111827] dark:border-white shadow-xl relative h-full p-6 sm:p-8 bg-white dark:bg-[#16171d]">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#111827] text-white dark:bg-white dark:text-black z-20">
                  Student Workspace
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Academic Portal</div>
                  <h3 className="text-2xl font-black text-[#111827] dark:text-white mb-2">Student</h3>
                  <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] mb-6">
                    Your personal academic workspace with attendance tracking, deadline calendar, and AI study companion.
                  </p>
                  <div className="space-y-2.5 text-xs text-[#374151] dark:text-[#d1d5db] mb-8">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Personal Attendance Percentage & Alert Thresholds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>One-Click Assignment Submissions & File History</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>24/7 AI Academic Assistant & Exam Notes Summarizer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Placement Drive Eligibility & One-Tap Applications</span>
                    </div>
                  </div>
                </div>
                <Link to="/register?role=student" className="btn-pill-primary w-full text-center">
                  <span className="text-container">
                    <span className="text">
                      <span>Join as Student</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </SnappyReticle>

          {/* Card 2: Faculty & Admin */}
          <SnappyReticle enableClickPop={true} className="w-full h-full">
            <div className="uiverse-glow-card h-full">
              <div className="uiverse-glow-inner flex flex-col justify-between h-full p-6 sm:p-8 bg-white dark:bg-[#16171d]">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Institutional Portal</div>
                  <h3 className="text-2xl font-black text-[#111827] dark:text-white mb-2">Faculty & Admin</h3>
                  <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] mb-6">
                    Manage courses, post updates, track your class, record batch attendance, and broadcast notices.
                  </p>
                  <div className="space-y-2.5 text-xs text-[#374151] dark:text-[#d1d5db] mb-8">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Batch Attendance Recording & Class Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Assignment Creation & Grading Workflow</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Syllabus Notes & Question Bank Distribution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Campus Event Notices & Placement Publishing</span>
                    </div>
                  </div>
                </div>
                <Link to="/register?role=faculty" className="btn-pill-secondary w-full text-center">
                  <span>Join as Faculty</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </SnappyReticle>
        </div>
      </motion.section>

      {/* 7. FAQ ACCORDION SECTION (Two-Column Layout) */}
      <motion.section
        id="faq"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 py-20 max-w-6xl mx-auto px-4 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          <div className="lg:col-span-5">
            <span className="badge-chip mb-4">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-white mb-4">
              Frequently asked questions.
            </h2>
            <p className="text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-6">
              Have questions about data privacy, AI assistant visibility, or university onboarding? Here are the most common inquiries.
            </p>
            <div className="p-5 rounded-2xl bg-[#f0f2fa] dark:bg-[#181a20] border border-[#dadff0] dark:border-[#272a33]">
              <div className="text-xs font-bold text-[#111827] dark:text-white mb-1">Need department onboarding?</div>
              <p className="text-xs text-slate-500 mb-3">Our team can configure custom department schemas for your college.</p>
              <a href="mailto:support@unisphere.edu" className="text-xs font-bold text-[#111827] dark:text-white hover:underline flex items-center gap-1">
                Contact Academic Support <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="card-popout rounded-2xl border border-[#e2e5f0] dark:border-[#26282e] bg-white dark:bg-[#18191d] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-[#111827] dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <span className="w-6 h-6 rounded-full bg-[#f0f2fa] dark:bg-[#252831] flex items-center justify-center text-xs ml-4 flex-shrink-0 font-mono">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] leading-relaxed border-t border-[#e2e5f0] dark:border-[#22242a] pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* 8. FINAL SIGNUP / CTA SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 py-20 border-t border-[#e2e5f0] dark:border-[#26282e] bg-[#f0f2fa] dark:bg-[#141518]"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            <div className="lg:col-span-6">
              <span className="badge-chip mb-4">Get Started</span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#111827] dark:text-white mb-4 leading-tight">
                Your whole semester, <br />
                organized in one place.
              </h2>
              <p className="text-sm sm:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed mb-6 max-w-md">
                Join thousands of students and faculty members who manage their university life effortlessly through UniSphere.
              </p>
              <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                <span>✓ Instant Access</span>
                <span>✓ Google Sign-In Ready</span>
                <span>✓ Zero Setup Fee</span>
              </div>
            </div>

            {/* Pill Signup Form Card */}
            <div className="lg:col-span-6">
              <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#272a33] rounded-3xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#111827] dark:text-white mb-1">Create your workspace</h3>
                <p className="text-xs text-slate-500 mb-6">Enter your details to join your campus platform instantly.</p>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label">First name</label>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        className="input-field rounded-full bg-[#f8f9fd] dark:bg-[#131417] border-[#e2e5f0] dark:border-[#282a32]"
                      />
                    </div>
                    <div>
                      <label className="label">Last name</label>
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                        className="input-field rounded-full bg-[#f8f9fd] dark:bg-[#131417] border-[#e2e5f0] dark:border-[#282a32]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">University Email</label>
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="input-field rounded-full bg-[#f8f9fd] dark:bg-[#131417] border-[#e2e5f0] dark:border-[#282a32]"
                    />
                  </div>

                  <div>
                    <label className="label">Join as</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupForm({ ...signupForm, role: 'student' })}
                        className={`py-2 px-4 rounded-full text-xs font-semibold border transition-all ${
                          signupForm.role === 'student'
                            ? 'bg-[#111827] text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                            : 'bg-[#f8f9fd] dark:bg-[#141518] text-slate-700 dark:text-slate-300 border-[#e2e5f0] dark:border-[#2b2e38]'
                        }`}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupForm({ ...signupForm, role: 'faculty' })}
                        className={`py-2 px-4 rounded-full text-xs font-semibold border transition-all ${
                          signupForm.role === 'faculty'
                            ? 'bg-[#111827] text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                            : 'bg-[#f8f9fd] dark:bg-[#141518] text-slate-700 dark:text-slate-300 border-[#e2e5f0] dark:border-[#2b2e38]'
                        }`}
                      >
                        Faculty / Admin
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-pill-primary w-full py-3.5 text-sm mt-3">
                    <span className="text-container">
                      <span className="text">
                        <span>Create my account</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 9. MINIMALIST FOOTER */}
      <footer className="relative z-10 py-12 max-w-6xl mx-auto px-4 sm:px-6 text-left border-t border-[#e2e5f0] dark:border-[#26282e]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#111827] dark:bg-white flex items-center justify-center text-white dark:text-[#111827]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#111827] dark:text-white">
              UniSphere
            </span>
            <span className="text-xs text-slate-500 ml-2">&copy; {new Date().getFullYear()} UniSphere Academic. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
            <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">About</a>
            <a href="mailto:support@unisphere.edu" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
            <Link to="/login" className="hover:text-black dark:hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-black dark:hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

      {/* 10. FIXED BOTTOM-RIGHT PILL CONTROL */}
      <FloatingControlPill />
    </div>
  );
};

export default LandingPage;

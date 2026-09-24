import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Mail, Lock, User, Hash, Building, GraduationCap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    department: 'Computer Science',
    year: '3',
    semester: '5',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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

    const payload = {
      ...form,
      year: form.year ? Number(form.year) : undefined,
      semester: form.semester ? Number(form.semester) : undefined,
    };

    const result = await register(payload);
    if (result.success) {
      toast.success('Account created successfully! Welcome to UniSphere.');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen ambient-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft Ambient Radial Blur Accents */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-3xl pointer-events-none" />

      {/* Glassmorphism Auth Card */}
      <motion.div
        className="glass-panel w-full max-w-lg p-8 relative shadow-2xl"
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create your smart university account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            {['student', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  form.role === r
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === 'admin' ? 'Admin / Faculty' : 'Student'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  className="input-field pl-10 text-xs"
                  placeholder="Alex Rivera"
                  value={form.name}
                  onChange={set('name')}
                />
              </div>
            </div>

            <div>
              <label className="label">University Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  className="input-field pl-10 text-xs"
                  placeholder="alex@uni.edu"
                  value={form.email}
                  onChange={set('email')}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field pl-10 pr-10 text-xs"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={set('password')}
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

          {form.role === 'student' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="col-span-2 sm:col-span-2">
                <label className="label">Department</label>
                <input
                  type="text"
                  className="input-field text-xs"
                  placeholder="Computer Science"
                  value={form.department}
                  onChange={set('department')}
                />
              </div>

              <div>
                <label className="label">Year</label>
                <select className="input-field text-xs" value={form.year} onChange={set('year')}>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Semester</label>
                <select className="input-field text-xs" value={form.semester} onChange={set('semester')}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            id="reg-submit"
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2.5 mt-2 shadow-md shadow-indigo-600/20"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;

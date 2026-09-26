import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Building,
  GraduationCap,
  Award,
  BookOpen,
  Edit3,
  Save,
  X,
  Globe,
  ShieldCheck,
  MapPin,
  Layers,
  FileCheck,
  ExternalLink,
  Camera,
  Sparkles,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../api/axios';

const GithubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const ProfilePage = () => {
  const { user, updateProfile, fetchMe } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [stats, setStats] = useState({
    attendanceAvg: 86,
    assignmentsDone: 12,
    upcomingExams: 3,
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    department: user?.department || 'Computer Science',
    rollNumber: user?.rollNumber || '',
    year: user?.year || 3,
    semester: user?.semester || 6,
    cgpa: user?.cgpa || 8.8,
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    website: user?.website || '',
    bio: user?.bio || '',
    skills: user?.skills || ['React', 'Node.js', 'Python', 'Data Structures', 'Machine Learning'],
    // Faculty specific
    employeeId: user?.employeeId || '',
    designation: user?.designation || 'Associate Professor',
    officeLocation: user?.officeLocation || 'Room 402, Block C, Ramanujan Hall',
    officeHours: user?.officeHours || 'Mon, Wed: 2:00 PM - 4:30 PM',
    researchAreas: user?.researchAreas || 'Distributed Systems, Cloud Computing & Applied AI',
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        department: user.department || 'Computer Science',
        rollNumber: user.rollNumber || (user.role === 'student' ? '22BCE10423' : ''),
        year: user.year || 3,
        semester: user.semester || 6,
        cgpa: user.cgpa || 8.8,
        github: user.github || 'https://github.com/lisachristine',
        linkedin: user.linkedin || 'https://linkedin.com/in/lisachristine',
        website: user.website || '',
        bio: user.bio || (user.role === 'student' 
          ? 'Third-year undergraduate specializing in Distributed Systems & AI. Passionate about building robust full-stack applications and high-throughput microservices.'
          : 'Faculty advisor focusing on modern computing architectures, algorithmic research, and student mentorship.'),
        skills: user.skills?.length ? user.skills : (user.role === 'student'
          ? ['React.js', 'Node.js', 'Python', 'TypeScript', 'Data Structures', 'PostgreSQL', 'Docker']
          : ['Distributed Systems', 'Cloud Architectures', 'Curriculum Design', 'AI Research', 'Mentorship']),
        employeeId: user.employeeId || (user.role !== 'student' ? 'FAC-2024-884' : ''),
        designation: user.designation || (user.role !== 'student' ? 'Associate Professor' : ''),
        officeLocation: user.officeLocation || (user.role !== 'student' ? 'Room 402, Block C, Ramanujan Hall' : ''),
        officeHours: user.officeHours || (user.role !== 'student' ? 'Mon, Wed: 2:00 PM - 4:30 PM' : ''),
        researchAreas: user.researchAreas || (user.role !== 'student' ? 'Distributed Systems, Cloud Computing & Applied AI' : ''),
      });
    }
  }, [user]);

  // Fetch live stats for student
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        if (user?.role === 'student') {
          const [attRes, assRes] = await Promise.allSettled([
            api.get('/attendance/my'),
            api.get('/assignments'),
          ]);
          if (attRes.status === 'fulfilled' && attRes.value.data?.records) {
            const records = attRes.value.data.records;
            const present = records.filter(r => r.status === 'present').length;
            const pct = records.length > 0 ? Math.round((present / records.length) * 100) : 86;
            setStats(prev => ({ ...prev, attendanceAvg: pct }));
          }
          if (assRes.status === 'fulfilled' && assRes.value.data?.assignments) {
            setStats(prev => ({ ...prev, assignmentsDone: assRes.value.data.assignments.length }));
          }
        }
      } catch {}
    };
    fetchQuickStats();
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setFormData(prev => ({ ...prev, avatar: base64 }));
      try {
        const res = await updateProfile({ avatar: base64 });
        if (res.success) {
          toast.success('Profile photo updated successfully!');
          if (fetchMe) fetchMe();
        } else {
          toast.error(res.message || 'Failed to save profile picture');
        }
      } catch (err) {
        toast.error('Error uploading profile picture');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove),
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        if (fetchMe) fetchMe();
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    }
    setSubmitting(false);
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Hidden Profile Picture Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner & Profile Header */}
      <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl overflow-hidden shadow-sm">
        {/* Ambient Top Pattern Bar */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden flex items-end p-6">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute right-6 top-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Institutional Account
            </span>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
            {/* Left: Avatar (overlapping banner) + Details (sitting below banner) */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
              {/* Avatar Box with clean negative margin over banner */}
              <div className="relative -mt-12 sm:-mt-14 shrink-0 group">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-[#111827] dark:bg-white text-white dark:text-[#111827] border-4 border-white dark:border-[#18191d] flex items-center justify-center shadow-xl cursor-pointer relative transition-all duration-200 group-hover:ring-4 group-hover:ring-purple-500/25"
                  title="Click to change profile photo"
                >
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt={user?.name || 'User Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}

                  {/* Hover overlay with Camera Icon */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[2px]">
                    <Camera className="w-5 h-5 mb-1 text-white" />
                    <span className="text-[10px] font-bold tracking-tight">Change</span>
                  </div>
                </div>

                {/* Small Camera Button Overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white dark:bg-[#1f2128] text-purple-600 dark:text-purple-400 border border-[#e2e5f0] dark:border-[#2f3340] shadow-md hover:scale-110 active:scale-95 transition-all"
                  title="Upload profile picture"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Name, Role & Department Block - Cleanly below banner */}
              <div className="pt-1 sm:pt-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#111827] dark:text-white tracking-tight">
                    {user?.name || 'Your Name'}
                  </h1>
                  <span className="badge-chip font-bold text-xs uppercase tracking-wider">
                    {user?.role || 'student'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  {isStudent
                    ? `${formData.department} Department • Year ${formData.year}, Semester ${formData.semester}`
                    : `${formData.designation || 'Faculty'} • ${formData.department}`}
                </p>
              </div>
            </div>

            {/* Edit / Save Action Buttons */}
            <div className="flex items-center gap-3 pt-1 sm:pt-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-pill-secondary text-xs px-4 py-2.5"
                    disabled={submitting}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-pill-primary text-xs px-5 py-2.5"
                    disabled={submitting}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-pill-primary text-xs px-5 py-2.5 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Social & Contact Badges with generous vertical spacing */}
          <div className="flex flex-wrap items-center gap-2.5 pt-5 border-t border-[#e2e5f0] dark:border-[#22242a]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </div>

            {formData.phone && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{formData.phone}</span>
              </div>
            )}

            {formData.github && (
              <a
                href={formData.github.startsWith('http') ? formData.github : `https://${formData.github}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-white transition-all group"
              >
                <GithubIcon className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span>GitHub Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400 opacity-60" />
              </a>
            )}

            {formData.linkedin && (
              <a
                href={formData.linkedin.startsWith('http') ? formData.linkedin : `https://${formData.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-white transition-all group"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400 opacity-60" />
              </a>
            )}

            {formData.website && (
              <a
                href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-white transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3 text-slate-400 opacity-60" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Info + Edit Mode or View Mode */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Bio & Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Edit Form Card */}
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#e2e5f0] dark:border-[#22242a] mb-6">
                <div>
                  <h2 className="text-base font-bold text-[#111827] dark:text-white">Edit Academic Profile</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Keep your official campus credentials, semester details, and social links up to date.</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5 text-left">
                {/* Basic Personal Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Legal Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Registered Email (Read-Only)</label>
                    <input
                      type="email"
                      className="input-field opacity-70 cursor-not-allowed"
                      value={formData.email}
                      disabled
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                {isStudent ? (
                  <>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Registration / Roll No.</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. 22BCE10423"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Academic Year</label>
                        <select
                          className="input-field"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        >
                          <option value={1}>1st Year (Freshman)</option>
                          <option value={2}>2nd Year (Sophomore)</option>
                          <option value={3}>3rd Year (Junior)</option>
                          <option value={4}>4th Year (Senior)</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Current Semester</label>
                        <select
                          className="input-field"
                          value={formData.semester}
                          onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s}>Semester {s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Department / Branch</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Computer Science & Engineering"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Current Cumulative CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          max="10"
                          min="0"
                          className="input-field"
                          placeholder="8.85"
                          value={formData.cgpa}
                          onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Employee / Faculty ID</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. FAC-2024-884"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Academic Designation</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. Professor & Head of Department"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Cabin / Office Location</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. Room 402, Block C, Ramanujan Hall"
                          value={formData.officeLocation}
                          onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Consultation / Office Hours</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. Mon, Wed: 2:00 PM - 4:30 PM"
                          value={formData.officeHours}
                          onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Research Specializations & Key Topics</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Distributed Systems, Neural Network Optimization, Cloud Security"
                        value={formData.researchAreas}
                        onChange={(e) => setFormData({ ...formData, researchAreas: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Social & Professional Links */}
                <div className="pt-3 border-t border-[#e2e5f0] dark:border-[#22242a]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Professional & Social Links
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label flex items-center gap-1.5">
                        <GithubIcon className="w-3.5 h-3.5 text-purple-600" />
                        <span>GitHub Profile URL</span>
                      </label>
                      <input
                        type="url"
                        className="input-field"
                        placeholder="https://github.com/username"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-1.5">
                        <LinkedinIcon className="w-3.5 h-3.5 text-purple-600" />
                        <span>LinkedIn Profile URL</span>
                      </label>
                      <input
                        type="url"
                        className="input-field"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="label">Personal Website / Portfolio</label>
                      <input
                        type="url"
                        className="input-field"
                        placeholder="https://yourportfolio.dev"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Contact Phone Number</label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Bio / Summary Statement */}
                <div>
                  <label className="label">Academic Statement / Bio</label>
                  <textarea
                    rows={3}
                    className="input-field min-h-[90px] resize-none text-xs sm:text-sm"
                    placeholder="Briefly describe your academic background, areas of focus, or research interests..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-pill-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-pill-primary flex-1"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving Profile...' : 'Save & Publish Profile ↗'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* View Mode */
            <>
              {/* Bio Statement Card */}
              <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h2 className="text-base font-bold text-[#111827] dark:text-white">About & Summary</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {formData.bio || 'No bio entered yet. Click "Edit Profile" to add your personal statement, interests, and academic summary.'}
                </p>
              </div>

              {/* Core Credentials Bento */}
              <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8">
                <h2 className="text-base font-bold text-[#111827] dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  Institutional Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  {isStudent ? (
                    <>
                      <div className="p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Registration Number</span>
                        <p className="font-mono font-bold text-[#111827] dark:text-white text-sm mt-1">
                          {formData.rollNumber || '22BCE10423'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Academic Standing</span>
                        <p className="font-bold text-[#111827] dark:text-white text-sm mt-1">
                          Year {formData.year} &bull; Semester {formData.semester}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Department / Branch</span>
                        <p className="font-bold text-[#111827] dark:text-white text-sm mt-1">
                          {formData.department || 'Computer Science'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Current CGPA Score</span>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-1">
                          {formData.cgpa || '8.80'} / 10.0
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Faculty / Employee ID</span>
                        <p className="font-mono font-bold text-[#111827] dark:text-white text-sm mt-1">
                          {formData.employeeId || 'FAC-2024-884'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Academic Designation</span>
                        <p className="font-bold text-[#111827] dark:text-white text-sm mt-1">
                          {formData.designation || 'Associate Professor'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Cabin / Office Room</span>
                        <p className="font-bold text-[#111827] dark:text-white text-sm mt-1">
                          {formData.officeLocation || 'Room 402, Block C'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Consultation Timings</span>
                        <p className="font-bold text-[#111827] dark:text-white text-sm mt-1">
                          {formData.officeHours || 'Mon, Wed: 2:00 PM - 4:30 PM'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {!isStudent && formData.researchAreas && (
                  <div className="mt-4 p-4 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Research Areas & Specializations</span>
                    <p className="font-semibold text-[#111827] dark:text-white text-xs mt-1">
                      {formData.researchAreas}
                    </p>
                  </div>
                )}
              </div>

              {/* Skills & Technical Tags */}
              <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#111827] dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    {isStudent ? 'Technical Skills & Domains' : 'Academic & Research Domains'}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    Manage Skills
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills?.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#e6e9f6] dark:bg-[#252831] text-[#111827] dark:text-[#f3f4f6] border border-[#dadff0] dark:border-[#2f3340] shadow-sm"
                    >
                      {s}
                    </span>
                  ))}
                  {(!formData.skills || formData.skills.length === 0) && (
                    <p className="text-xs text-slate-400">No skills added yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column (4 cols): Quick Stats & Verification */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status / Quick Stats */}
          {isStudent ? (
            <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#111827] dark:text-white mb-4">
                Academic Performance Snapshot
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    Attendance Average
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.attendanceAvg}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    Completed Coursework
                  </span>
                  <span className="font-bold text-[#111827] dark:text-white">
                    {stats.assignmentsDone} Tasks
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    Cumulative GPA
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {formData.cgpa || 8.8} / 10
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#111827] dark:text-white mb-4">
                Department Faculty Status
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-purple-600" />
                    Department
                  </span>
                  <span className="font-bold text-[#111827] dark:text-white">
                    {formData.department}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    Office Room
                  </span>
                  <span className="font-bold text-[#111827] dark:text-white">
                    {formData.officeLocation?.split(',')?.[0] || 'Room 402'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38]">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Status
                  </span>
                  <span className="font-bold text-emerald-600">Available</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links Card */}
          <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#111827] dark:text-white mb-3">
              Direct Profiles
            </h3>

            <div className="space-y-2">
              <a
                href={formData.github.startsWith('http') ? formData.github : `https://${formData.github}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] text-xs font-semibold text-[#111827] dark:text-white hover:border-black dark:hover:border-white transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <GithubIcon className="w-4 h-4 text-purple-600" />
                  <span>GitHub Repository</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href={formData.linkedin.startsWith('http') ? formData.linkedin : `https://${formData.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#f8f9fd] dark:bg-[#141518] border border-[#e2e5f0] dark:border-[#2b2e38] text-xs font-semibold text-[#111827] dark:text-white hover:border-black dark:hover:border-white transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <LinkedinIcon className="w-4 h-4 text-purple-600" />
                  <span>LinkedIn Network</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

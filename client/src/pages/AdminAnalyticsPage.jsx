import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Building,
  GraduationCap,
  Calendar,
  Download,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function AdminAnalyticsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('current_sem');

  const deptStats = [
    { name: 'Computer Science & Eng', students: 480, avgAttendance: 84.5, submissionRate: 91.2, placementRate: 88.0 },
    { name: 'Electronics & Communication', students: 360, avgAttendance: 78.2, submissionRate: 85.4, placementRate: 82.5 },
    { name: 'Information Technology', students: 310, avgAttendance: 82.0, submissionRate: 89.0, placementRate: 86.4 },
    { name: 'Mechanical Engineering', students: 290, avgAttendance: 74.8, submissionRate: 79.5, placementRate: 76.0 },
    { name: 'Civil Engineering', students: 220, avgAttendance: 72.4, submissionRate: 76.0, placementRate: 71.5 },
  ];

  const attendanceTrends = [
    { month: 'Jan', rate: 89.2 },
    { month: 'Feb', rate: 86.4 },
    { month: 'Mar', rate: 81.7 },
    { month: 'Apr', rate: 84.1 },
    { month: 'May', rate: 82.8 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedTimeframe]);

  const handleExport = () => {
    toast.success('Institutional analytics report exported to CSV');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6e9f6] dark:bg-[#1e2027] text-slate-700 dark:text-slate-300 mb-2">
            <span>Executive Reporting</span>
          </div>
          <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">Institutional Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time aggregate compliance, pass metrics, and department benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="segmented-pill-container">
            <button
              onClick={() => setSelectedTimeframe('current_sem')}
              className={`segmented-pill-item ${selectedTimeframe === 'current_sem' ? 'segmented-pill-item-active' : ''}`}
            >
              Current Term
            </button>
            <button
              onClick={() => setSelectedTimeframe('academic_year')}
              className={`segmented-pill-item ${selectedTimeframe === 'academic_year' ? 'segmented-pill-item-active' : ''}`}
            >
              Full Year
            </button>
          </div>

          <button onClick={handleExport} className="btn-pill-primary text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* High-Level Institutional Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <Users className="w-4 h-4 text-[#111827] dark:text-white" />
          </div>
          <p className="text-3xl font-black text-[#111827] dark:text-white">1,660</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Across 5 Departments</p>
        </div>

        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-[#111827] dark:text-white">80.4%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Above 75% minimum threshold</p>
        </div>

        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Assignment Pass Rate</span>
            <FileCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-[#111827] dark:text-white">84.2%</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">On-time student submissions</p>
        </div>

        <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Placement Placement</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-[#111827] dark:text-white">80.8%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">45 corporate partner drives</p>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e5f0] dark:border-[#22242a]">
          <h2 className="text-base font-bold text-[#111827] dark:text-white">Department Academic Benchmarks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fd] dark:bg-[#141518] text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                {['Department', 'Students', 'Avg Attendance', 'Assignment Rate', 'Placement Rate'].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e5f0] dark:divide-[#22242a] text-xs">
              {deptStats.map((d) => (
                <tr key={d.name} className="hover:bg-[#f8f9fd] dark:hover:bg-[#1e2026] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#111827] dark:text-white">{d.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{d.students}</td>
                  <td className="px-6 py-4">
                    <span className={d.avgAttendance >= 75 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {d.avgAttendance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#111827] dark:text-white">{d.submissionRate}%</td>
                  <td className="px-6 py-4">
                    <span className="badge-chip font-bold text-emerald-700 dark:text-emerald-300">
                      {d.placementRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

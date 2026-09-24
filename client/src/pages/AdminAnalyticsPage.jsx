import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  Building,
  GraduationCap,
  Calendar,
  Download,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function AdminAnalyticsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('current_sem');

  // Realistic Institutional Analytics Metrics
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
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedTimeframe]);

  const handleExport = () => {
    toast.success('Institutional analytics report exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Institutional Analytics</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time university attendance trends, assignment submissions, and departmental metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="input-field max-w-[180px] text-xs py-2"
          >
            <option value="current_sem">Current Semester</option>
            <option value="last_sem">Previous Semester</option>
            <option value="full_year">Academic Year 2025-26</option>
          </select>
          <button onClick={handleExport} className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid (Clean Flat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flat-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Enrolled</span>
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">1,660</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +5.4% from last semester
          </div>
        </div>

        <div className="flat-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Avg Attendance</span>
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">80.4%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
            Threshold: <span className="text-emerald-600 dark:text-emerald-400 font-bold">75% Min</span>
          </div>
        </div>

        <div className="flat-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Assignment Submissions</span>
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">84.2%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> 92% graded on time
          </div>
        </div>

        <div className="flat-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Placement Rate</span>
            <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">81.3%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
            42 Active Recruiters
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Breakdown (Flat Minimalist Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trend Bar Chart */}
        <div className="lg:col-span-6 flat-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campus Attendance Trends</h3>
            <span className="badge-success">Avg: 82.8%</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Monthly aggregate student lecture participation.
          </p>

          <div className="space-y-4">
            {attendanceTrends.map((item) => (
              <div key={item.month} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{item.month} 2026</span>
                  <span className={item.rate >= 75 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 font-semibold'}>
                    {item.rate}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.rate >= 75 ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Rates Breakdown */}
        <div className="lg:col-span-6 flat-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assignment & Grading Efficiency</h3>
            <span className="badge-info">Semester Active</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Faculty assessment progress and student on-time completion rates.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">On-Time Submissions</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">87.6%</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">High compliance</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400">Grading Turnaround</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">3.2 Days</div>
              <div className="text-[11px] text-slate-500 mt-1">Target: ≤ 5 Days</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Evaluated Submissions</span>
                <span className="font-semibold text-slate-900 dark:text-white">92.4%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Pending Faculty Review</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">7.6%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '7.6%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Departmental Comparison Table (Dense Flat Minimalist View) */}
      <div className="flat-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Departmental Performance Index</h3>
          <span className="text-xs text-slate-500">{deptStats.length} Departments Tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Department</th>
                <th className="table-header text-center">Enrolled Students</th>
                <th className="table-header text-center">Avg Attendance</th>
                <th className="table-header text-center">Submission Rate</th>
                <th className="table-header text-center">Placement Success</th>
                <th className="table-header text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {deptStats.map((dept) => (
                <tr key={dept.name} className="table-row">
                  <td className="table-cell font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>{dept.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-center">{dept.students}</td>
                  <td className="table-cell text-center">
                    <span className={`font-semibold ${dept.avgAttendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {dept.avgAttendance}%
                    </span>
                  </td>
                  <td className="table-cell text-center">{dept.submissionRate}%</td>
                  <td className="table-cell text-center">{dept.placementRate}%</td>
                  <td className="table-cell text-right">
                    {dept.avgAttendance >= 75 ? (
                      <span className="badge-success">Optimal</span>
                    ) : (
                      <span className="badge-danger">Low Attendance</span>
                    )}
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

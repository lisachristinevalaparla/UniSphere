import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend, trendUp }) => {
  return (
    <motion.div
      className="card-popout bg-white dark:bg-[#18191d] border border-[#e2e5f0] dark:border-[#26282e] rounded-3xl p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {Icon && (
          <div className="w-9 h-9 rounded-full bg-[#f0f2fa] dark:bg-[#252831] flex items-center justify-center text-[#111827] dark:text-white shadow-sm">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <p className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">
        {value}
      </p>

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
          {subtitle}
        </p>
      )}

      {trend !== undefined && (
        <div className={`inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
          trendUp
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
        }`}>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{trend}</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;

import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend, trendUp }) => {
  const colorMap = {
    indigo: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
      iconText: 'text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-400/40',
    },
    amber: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/50',
      iconText: 'text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-400/40',
    },
    cyan: {
      iconBg: 'bg-blue-50 dark:bg-blue-950/50',
      iconText: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-400/40',
    },
    emerald: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-400/40',
    },
    rose: {
      iconBg: 'bg-rose-50 dark:bg-rose-950/50',
      iconText: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-400/40',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      className={`glass-panel p-5 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 ${scheme.border}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${scheme.iconBg} ${scheme.iconText} shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {value}
      </p>

      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
          {subtitle}
        </p>
      )}

      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{trend}</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;

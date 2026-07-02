import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, colorClass = "text-primary-600 bg-primary-100 dark:bg-primary-900/40 dark:text-primary-400" }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-hover hover:shadow-md">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white leading-none">{value}</h4>
          {trend && (
            <span className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

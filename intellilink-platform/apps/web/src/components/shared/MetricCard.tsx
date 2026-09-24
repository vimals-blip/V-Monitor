import React from 'react';
import Link from 'next/link';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'blue';
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, subtitle, href, badge, badgeColor = 'blue', icon }: MetricCardProps) {
  const content = (
    <div className="bg-white dark:bg-[#0F172A]/80 hover:bg-slate-50 dark:hover:bg-[#131D33] border border-slate-200 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-4.5 transition-all cursor-pointer relative overflow-hidden group shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && <div className="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{icon}</div>}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">{value}</span>
        {badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
            badgeColor === 'rose' ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
            badgeColor === 'amber' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
            badgeColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
            'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
          }`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

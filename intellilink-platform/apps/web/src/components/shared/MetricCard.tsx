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
    <div className="bg-[#121824] border border-[#222E45] rounded-lg p-4 hover:border-[#384b6e] transition-all cursor-pointer relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            badgeColor === 'rose' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
            badgeColor === 'amber' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
            badgeColor === 'emerald' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
            'bg-blue-950 text-blue-400 border border-blue-800'
          }`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-400 transition-all" />
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

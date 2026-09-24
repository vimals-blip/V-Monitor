import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  let bg = 'bg-slate-800/60 text-slate-300 border-slate-700/60';
  let dot = 'bg-slate-400';
  let shouldPulse = false;

  if (s === 'ONLINE' || s === 'UP' || s === 'ACTIVE' || s === 'HEALTHY' || s === 'RESOLVED') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    dot = 'bg-emerald-500 dark:bg-emerald-400';
  } else if (s === 'DEGRADED' || s === 'WARNING' || s === 'INVESTIGATING' || s === 'PROVISIONING') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    dot = 'bg-amber-500 dark:bg-amber-400';
    shouldPulse = true;
  } else if (s === 'OFFLINE' || s === 'DOWN' || s === 'CRITICAL' || s === 'FAILED') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    dot = 'bg-rose-500 dark:bg-rose-400';
    shouldPulse = true;
  } else if (s === 'MAINTENANCE' || s === 'DRAINED') {
    bg = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
    dot = 'bg-purple-500 dark:bg-purple-400';
  } else {
    bg = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60';
    dot = 'bg-slate-400 dark:bg-slate-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${shouldPulse ? 'animate-pulse' : ''}`} />
      <span>{status}</span>
    </span>
  );
}

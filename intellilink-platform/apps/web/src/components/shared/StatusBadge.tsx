import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  let bg = 'bg-slate-800/60 text-slate-300 border-slate-700/60';
  let dot = 'bg-slate-400';
  let shouldPulse = false;

  if (s === 'ONLINE' || s === 'UP' || s === 'ACTIVE' || s === 'HEALTHY' || s === 'RESOLVED') {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    dot = 'bg-emerald-400';
  } else if (s === 'DEGRADED' || s === 'WARNING' || s === 'INVESTIGATING' || s === 'PROVISIONING') {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dot = 'bg-amber-400';
    shouldPulse = true;
  } else if (s === 'OFFLINE' || s === 'DOWN' || s === 'CRITICAL' || s === 'FAILED') {
    bg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    dot = 'bg-rose-400';
    shouldPulse = true;
  } else if (s === 'MAINTENANCE' || s === 'DRAINED') {
    bg = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    dot = 'bg-purple-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${shouldPulse ? 'animate-pulse' : ''}`} />
      <span>{status}</span>
    </span>
  );
}

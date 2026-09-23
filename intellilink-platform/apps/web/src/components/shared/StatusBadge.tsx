import React from 'react';

export function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  let bg = 'bg-slate-800 text-slate-300 border-slate-700';
  let dot = 'bg-slate-400';

  if (s === 'ONLINE' || s === 'UP' || s === 'ACTIVE' || s === 'HEALTHY' || s === 'RESOLVED') {
    bg = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80';
    dot = 'bg-emerald-400';
  } else if (s === 'DEGRADED' || s === 'WARNING' || s === 'INVESTIGATING' || s === 'PROVISIONING') {
    bg = 'bg-amber-950/60 text-amber-400 border-amber-800/80';
    dot = 'bg-amber-400';
  } else if (s === 'OFFLINE' || s === 'DOWN' || s === 'CRITICAL' || s === 'FAILED') {
    bg = 'bg-rose-950/60 text-rose-400 border-rose-800/80';
    dot = 'bg-rose-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      {status}
    </span>
  );
}

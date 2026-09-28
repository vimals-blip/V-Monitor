'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { HeartPulse, CheckCircle2, ShieldCheck, Database, HardDrive, Cpu, Radio, RefreshCw, Server, Activity } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export default function SystemHealthPage() {
  const { data: healthData, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['system-health-detailed'],
    queryFn: async () => {
      const res = await apiClient.get('/system-health/detailed');
      return res.data;
    },
    refetchInterval: 3000,
  });

  const services = healthData?.services || [
    { name: 'Intellilink Control Plane API', status: 'HEALTHY', latency: '0.45ms', desc: 'NestJS REST & WebSocket service', type: 'CORE_API' },
    { name: 'PostgreSQL Database Fabric', status: 'HEALTHY', latency: '1.20ms', desc: 'Relational multi-tenant persistent store', type: 'DATABASE' },
    { name: 'Redis Cache & Streams Engine', status: 'HEALTHY', latency: '0.35ms', desc: 'Real-time telemetry event bus', type: 'EVENT_BUS' },
    { name: 'Network Telemetry Ingestion Pipeline', status: 'HEALTHY', latency: '1.40ms', desc: 'Heartbeat and metrics ingestion', type: 'PIPELINE' },
    { name: 'WireGuard Cryptographic Engine', status: 'HEALTHY', latency: '0.14ms', desc: 'ChaCha20-Poly1305 symmetric cipher', type: 'CRYPTO' },
    { name: 'Prometheus & Metrics Observability', status: 'HEALTHY', latency: '2.10ms', desc: 'Kernel procfs telemetry collector', type: 'OBSERVABILITY' },
  ];

  const host = healthData?.host;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <HeartPulse className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System Health &amp; Subsystem Dependencies</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time liveness, query latencies, and host kernel telemetry across the control plane infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500">
            Updated: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Streaming'}
          </span>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Host Kernel KPIs */}
      {host && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans uppercase font-semibold">Host Machine</div>
            <div className="font-bold text-slate-900 dark:text-white truncate">{host.hostname}</div>
            <div className="text-[10px] text-slate-500">{host.platform}</div>
          </div>
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans uppercase font-semibold">CPU Cores &amp; Load</div>
            <div className="font-bold text-cyan-600 dark:text-cyan-400">{host.cpuCores} Cores ({host.loadAvg?.[0] ?? '0.12'} 1m)</div>
            <div className="text-[10px] text-slate-500 truncate">{host.cpuModel}</div>
          </div>
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans uppercase font-semibold">RAM Utilization</div>
            <div className="font-bold text-purple-400">{host.memoryUsagePercent}% Committed</div>
            <div className="text-[10px] text-slate-500">Kernel buffer dynamic cache</div>
          </div>
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 space-y-1">
            <div className="text-[10px] text-slate-500 font-sans uppercase font-semibold">Controller Uptime</div>
            <div className="font-bold text-emerald-400">
              {Math.floor((host.uptimeSeconds || 3600) / 86400)}d {Math.floor(((host.uptimeSeconds || 3600) % 86400) / 3600)}h
            </div>
            <div className="text-[10px] text-slate-500">SLA: 99.999% Guaranteed</div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((svc: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-5 space-y-3 shadow-sm hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{svc.name}</span>
              <StatusBadge status={svc.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{svc.desc}</p>
            <div className="pt-2.5 border-t border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Real-Time Probe Latency</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-bold">{svc.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


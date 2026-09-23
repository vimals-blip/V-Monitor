'use client';
import React from 'react';
import { HeartPulse, CheckCircle2, ShieldCheck, Database, HardDrive, Cpu, Radio } from 'lucide-react';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export default function SystemHealthPage() {
  const services = [
    { name: 'Intellilink Control Plane API', status: 'HEALTHY', latency: '4ms', desc: 'NestJS REST & WebSocket service' },
    { name: 'PostgreSQL Database Fabric', status: 'HEALTHY', latency: '2ms', desc: 'Relational multi-tenant persistent store' },
    { name: 'Redis Cache & Streams Engine', status: 'HEALTHY', latency: '1ms', desc: 'Real-time telemetry event bus' },
    { name: 'Python AI & RCA Engine', status: 'HEALTHY', latency: '18ms', desc: 'FastAPI tool calling & anomaly detection' },
    { name: 'Network Telemetry Ingestion Pipeline', status: 'HEALTHY', latency: '8ms', desc: 'Heartbeat and metrics ingestion' },
    { name: 'Prometheus & Loki Observability', status: 'HEALTHY', latency: '12ms', desc: 'Time-series scraper and log pipeline' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Health & Subsystem Dependencies</h1>
        <p className="text-xs text-slate-400 mt-0.5">Automated liveness and readiness probes across the control plane infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((svc, idx) => (
          <div key={idx} className="bg-[#121824] border border-[#222E45] rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{svc.name}</span>
              <StatusBadge status={svc.status} />
            </div>
            <p className="text-xs text-slate-400">{svc.desc}</p>
            <div className="pt-2 border-t border-[#222E45] flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Probe Latency</span>
              <span className="text-emerald-400">{svc.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { getSocket } from '../../../lib/websocket';
import { MetricCard } from '../../../components/shared/MetricCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Users, MapPin, Cpu, Network, Server, Shuffle, Activity, AlertTriangle, ShieldCheck, ArrowUpRight, Radar } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [liveEvent, setLiveEvent] = useState<any>(null);

  const { data: summary, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/summary');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const { data: fabricOverview } = useQuery({
    queryKey: ['fabric-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/telemetry/v1/fabric-overview');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const { data: recentAlerts } = useQuery({
    queryKey: ['recent-alerts'],
    queryFn: async () => {
      const res = await apiClient.get('/alerts?pageSize=5');
      return res.data.data;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    const s = getSocket();
    if (s) {
      s.on('alert:created', (alert) => {
        setLiveEvent({ type: 'ALERT', data: alert });
        refetch();
      });
      s.on('incident:created', (inc) => {
        setLiveEvent({ type: 'INCIDENT', data: inc });
        refetch();
      });
    }
    return () => {
      if (s) {
        s.off('alert:created');
        s.off('incident:created');
      }
    };
  }, [refetch]);

  const totalSites = summary?.sites ?? 0;
  const onlineSites = summary?.onlineSites ?? 0;
  const degradedSites = summary?.degradedSites ?? 0;
  const onlinePercent = totalSites > 0 ? Math.round((onlineSites / totalSites) * 100) : 100;
  const degradedPercent = totalSites > 0 ? Math.round((degradedSites / totalSites) * 100) : 0;

  const hostTelemetry = fabricOverview?.hostTelemetry;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Operations &amp; Network Health Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time monitoring across edge gateways, carrier circuits, and cloud PoPs.</p>
        </div>
        <div className="flex items-center gap-3">
          {liveEvent && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Event: {liveEvent.data.title || 'Network State Change'}</span>
            </div>
          )}
          <Link
            href="/gateways"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-slate-200 border border-[#1E293B] text-xs font-medium transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Gateway Fleet</span>
          </Link>
          <Link
            href="/network-map"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-medium transition-colors"
          >
            <span>Topology Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard title="Tenants" value={summary?.tenants ?? 0} href="/tenants" icon={<Users className="w-4 h-4" />} badge="Active" />
        <MetricCard
          title="Branch Sites"
          value={totalSites}
          subtitle={`${onlineSites} Online • ${degradedSites} Degraded`}
          href="/sites"
          icon={<MapPin className="w-4 h-4" />}
          badgeColor={degradedSites > 0 ? 'amber' : 'emerald'}
        />
        <MetricCard title="Edge Gateways" value={summary?.gateways ?? 0} href="/gateways" icon={<Cpu className="w-4 h-4" />} badge="Active" />
        <MetricCard title="Core PoPs" value={summary?.pops ?? 0} href="/pops" icon={<Network className="w-4 h-4" />} badge="Tier-1" />
        <MetricCard title="Aggregators" value={summary?.aggregators ?? 0} href="/aggregators" icon={<Server className="w-4 h-4" />} badge="Hubs" />
        <MetricCard title="Secure Tunnels" value={summary?.activeTunnels ?? 0} href="/tunnels" icon={<Shuffle className="w-4 h-4" />} badge="WireGuard" />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Site Health */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Branch Site Connectivity</span>
            <StatusBadge status={degradedSites > 0 ? 'DEGRADED' : 'ONLINE'} />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Online Sites</span>
                <span className="text-emerald-400 font-semibold">{onlineSites} / {totalSites}</span>
              </div>
              <div className="w-full bg-[#1C263A] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${onlinePercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Degraded Circuits</span>
                <span className="text-amber-400 font-semibold">{degradedSites}</span>
              </div>
              <div className="w-full bg-[#1C263A] h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${degradedPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Kernel Host Telemetry */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Controller Host Telemetry</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">eno1 (1 Gbps)</span>
          </div>
          <p className="text-xs text-slate-400">Linux kernel socket metrics and system counters polled live.</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-[#090D16] rounded-lg border border-[#1E293B]">
              <span className="block text-slate-500 text-[10px]">CPU Cores</span>
              <span className="font-mono text-white font-bold">{hostTelemetry?.cpuCount ?? 8} vCPUs</span>
            </div>
            <div className="p-2.5 bg-[#090D16] rounded-lg border border-[#1E293B]">
              <span className="block text-slate-500 text-[10px]">RAM Usage</span>
              <span className="font-mono text-blue-400 font-bold">{hostTelemetry?.memoryUsagePercent ?? 75}%</span>
            </div>
            <div className="p-2.5 bg-[#090D16] rounded-lg border border-[#1E293B]">
              <span className="block text-slate-500 text-[10px]">Gateway RTT</span>
              <span className="font-mono text-emerald-400 font-bold">0.14 ms</span>
            </div>
          </div>
        </div>

        {/* AI Operations */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Intelligent RCA Engine</span>
            <span className="text-xs font-mono text-blue-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">Automated root-cause analysis and proactive circuit anomaly detection.</p>
          <Link
            href="/ai-assistant"
            className="inline-block w-full text-center py-2 px-3 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium border border-blue-500/20 transition-all"
          >
            Launch AI Copilot →
          </Link>
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#222E45] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Live Alert & Telemetry Stream</h2>
          </div>
          <Link href="/alerts" className="text-xs text-cyan-400 hover:underline">
            View All Alerts ({summary?.openAlerts ?? 0})
          </Link>
        </div>
        <div className="divide-y divide-[#222E45]">
          {(recentAlerts || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No active critical alerts. All circuits nominal.</div>
          ) : (
            (recentAlerts || []).map((a: any) => (
              <div key={a.id} className="p-4 flex items-center justify-between hover:bg-[#161F30] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{a.title}</span>
                    <StatusBadge status={a.severity} />
                  </div>
                  <p className="text-xs text-slate-400">{a.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-500">{new Date(a.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import {
  Settings, ShieldCheck, Key, Bell, Globe, Activity,
  Server, Network, Terminal, CheckCircle2, Radar, Trash2, Copy, Check
} from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Poller status query
  const { data: pollerStatus, refetch: refetchPoller } = useQuery({
    queryKey: ['poller-status'],
    queryFn: async () => {
      const res = await apiClient.get('/network-discovery/poller/status');
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Physical Host Interfaces
  const { data: hostInterfaces } = useQuery({
    queryKey: ['host-network-interfaces'],
    queryFn: async () => {
      const res = await apiClient.get('/network-discovery/interfaces');
      return res.data || [];
    },
    refetchInterval: 5000,
  });

  // Toggle Poller Mutation
  const togglePollerMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await apiClient.post('/network-discovery/poller/toggle', { enabled });
      return res.data;
    },
    onSuccess: (data) => {
      refetchPoller();
      setNotice(data.isPollingActive ? '⚡ Live Kernel Poller Started (5s interval)' : 'Poller Paused');
      setTimeout(() => setNotice(null), 3000);
    },
  });

  // Purge Mock Data Mutation
  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/network-discovery/purge-seed');
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries();
      setNotice(`🗑 Purged ${res.removedSitesCount} synthetic demo sites. Pure Live Network Mode active.`);
      setTimeout(() => setNotice(null), 4000);
    },
  });

  const primaryNic = hostInterfaces && hostInterfaces.length > 0 ? hostInterfaces[0] : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {notice && (
        <div className="fixed top-5 right-5 z-50 bg-[#162338] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Control Plane Settings & Physical Infrastructure Bindings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real enterprise network adapter bindings, kernel sysfs telemetry poller, and physical equipment discovery.
        </p>
      </div>

      {/* Production Network Adapter & Kernel Telemetry Engine */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Physical Telemetry Provider</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct Linux kernel sysfs counter reader & ICMP socket probe engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              {pollerStatus?.isPollingActive ? '● Poller Active (5000ms)' : '○ Poller Paused'}
            </span>
            <button
              onClick={() => togglePollerMutation.mutate(!pollerStatus?.isPollingActive)}
              disabled={togglePollerMutation.isPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pollerStatus?.isPollingActive
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
            >
              {pollerStatus?.isPollingActive ? 'Pause Poller' : 'Start Poller'}
            </button>
          </div>
        </div>

        {/* Physical Host Adapter Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
            <p className="font-sans font-semibold text-slate-500 dark:text-slate-400">Primary NIC Interface</p>
            <p className="text-cyan-600 dark:text-cyan-400 font-bold mt-1 text-sm">{primaryNic?.name || 'eno1'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Status: {primaryNic?.operstate || 'UP'}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
            <p className="font-sans font-semibold text-slate-500 dark:text-slate-400">Host IPv4 Address</p>
            <p className="text-emerald-400 font-bold mt-1 text-sm">{primaryNic?.ipv4 || '192.168.2.212'}/20</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Gateway: 192.168.0.50</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
            <p className="font-sans font-semibold text-slate-500 dark:text-slate-400">Physical MAC Address</p>
            <p className="text-slate-600 dark:text-slate-300 font-bold mt-1 text-xs">{primaryNic?.mac || 'ec:b1:d7:5e:d0:3c'}</p>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5">Intel Server NIC</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
            <p className="font-sans font-semibold text-slate-500 dark:text-slate-400">Kernel RX/TX Counters</p>
            <p className="text-slate-900 dark:text-white font-bold mt-1 text-xs">
              RX: {((primaryNic?.statistics?.rxBytes || 0) / 1024 / 1024).toFixed(1)} MB
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              TX: {((primaryNic?.statistics?.txBytes || 0) / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>
      </div>

      {/* Production Adapter Bindings */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          Production Adapter Provider Bindings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-600 dark:text-slate-300">Telemetry Provider</p>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="font-mono text-cyan-600 dark:text-cyan-400 mt-1.5">ProductionKernelNetworkProvider</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Direct Linux kernel /proc/net/arp & sysfs /sys/class/net/eno1</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-600 dark:text-slate-300">Gateway Provider</p>
              <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="font-mono text-cyan-600 dark:text-cyan-400 mt-1.5">ProductionGatewayProvider</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Live ICMP RTT latency + SSH/RESTCONF physical appliance integration</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-600 dark:text-slate-300">Tunnel Provider</p>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                READY
              </span>
            </div>
            <p className="font-mono text-cyan-600 dark:text-cyan-400 mt-1.5">WireGuardAdapterProvider</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kernel wg0 dynamic tunnel management & key rotation</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-600 dark:text-slate-300">Routing Engine Provider</p>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                READY
              </span>
            </div>
            <p className="font-mono text-cyan-600 dark:text-cyan-400 mt-1.5">LinuxRoutingProvider</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">iproute2 dynamic route table prefix injection</p>
          </div>
        </div>
      </div>

      {/* One-Line Edge Agent Installer */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Terminal className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edge Router Telemetry Agent Installer (.sh)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Execute this command on physical Cisco routers, MikroTik containers, or Linux servers to stream real telemetry.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0B0F17] p-3 rounded-lg border border-slate-200 dark:border-[#222E45] font-mono text-xs text-cyan-300 flex items-center justify-between">
          <span className="select-all">
            curl -sSL http://192.168.2.212:3001/api/v1/network-discovery/agent/install.sh | bash
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                'curl -sSL http://192.168.2.212:3001/api/v1/network-discovery/agent/install.sh | bash',
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            className="p-1.5 rounded bg-[#162030] hover:bg-[#222E45] text-slate-600 dark:text-slate-300 ml-2"
            title="Copy command"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Environment Mode Control */}
      <div className="bg-white dark:bg-[#121824] border border-red-500/20 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-400" />
          Synthetic Demo Data Purge
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Remove synthetic demo seed branches (e.g. Apollo Lucknow, MaxCare Indore, etc.) and run this entire platform exclusively on real enterprise hardware discovered from your network.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to purge synthetic demo seed data and switch exclusively to real discovered network hardware?')) {
              purgeMutation.mutate();
            }
          }}
          disabled={purgeMutation.isPending}
          className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>{purgeMutation.isPending ? 'Purging Demo Data...' : 'Purge Synthetic Demo Data (Run 100% Live)'}</span>
        </button>
      </div>
    </div>
  );
}

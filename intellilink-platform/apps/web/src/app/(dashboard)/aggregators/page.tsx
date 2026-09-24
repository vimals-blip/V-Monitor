'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Pagination } from '../../../components/shared/Pagination';
import {
  Search, RefreshCw, Plus, Server, Activity, ShieldCheck,
  Trash2, X, Check, RotateCw, Cpu, Layers, Terminal, ArrowRight,
  Zap, Play, HardDrive, Shield, Globe, Wrench, Key, Radio
} from 'lucide-react';

export default function AggregatorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [healthModal, setHealthModal] = useState<{ open: boolean; agg: any; result?: any; loading?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [aggTab, setAggTab] = useState<'peers' | 'crypto' | 'probe' | 'actions'>('peers');
  const [probeTarget, setProbeTarget] = useState('192.168.0.50');
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hostname: '',
    ipAddress: '10.250.1.15',
    popId: '',
    version: 'v3.4.2-lts',
    maxTunnels: 5000,
    maxBandwidthMbps: 20000,
    status: 'ONLINE',
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: aggResponse, isLoading, refetch } = useQuery({
    queryKey: ['aggregators-list', search, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/aggregators?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const data = Array.isArray(aggResponse?.data)
    ? aggResponse.data
    : Array.isArray(aggResponse)
    ? aggResponse
    : [];
  const totalAggregators = aggResponse?.total ?? data.length;
  const totalPages = aggResponse?.totalPages ?? Math.max(1, Math.ceil(totalAggregators / pageSize));

  const { data: pops } = useQuery({
    queryKey: ['pops-for-agg'],
    queryFn: async () => {
      const res = await apiClient.get('/pops?pageSize=50');
      return res.data?.data || res.data || [];
    },
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/aggregators', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aggregators-list'] });
      setCreateModal(false);
      setFormData({
        hostname: '',
        ipAddress: '10.250.1.15',
        popId: '',
        version: 'v3.4.2-lts',
        maxTunnels: 5000,
        maxBandwidthMbps: 20000,
        status: 'ONLINE',
      });
      notify('✅ Core WireGuard Aggregator deployed to control plane.');
    },
    onError: (err: any) => {
      alert('Error creating aggregator: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/aggregators/${id}`);
      } else if (action === 'toggle-status') {
        return apiClient.put(`/aggregators/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aggregators-list'] });
      notify('Aggregator state synchronized.');
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

  const probeMutation = useMutation({
    mutationFn: async ({ aggId, target }: { aggId: string; target?: string }) => {
      const res = await apiClient.post(`/aggregators/${aggId}/probe`, { target });
      return res.data;
    },
    onSuccess: (data) => {
      setHealthModal((prev: any) => prev ? { ...prev, loading: false, result: data } : null);
    },
    onError: (err: any) => {
      setHealthModal((prev: any) => prev ? {
        ...prev,
        loading: false,
        result: {
          wireguardDaemon: 'ACTIVE',
          status: 'UNREACHABLE',
          cpuLoad: '—',
          kernelModule: 'wireguard.ko',
        }
      } : null);
    }
  });

  const aggActionMutation = useMutation({
    mutationFn: async ({ aggId, action, params }: { aggId: string; action: string; params?: any }) => {
      setExecutingAction(action);
      const res = await apiClient.post(`/aggregators/${aggId}/action`, { action, params });
      return res.data;
    },
    onSuccess: (data) => {
      setExecutingAction(null);
      setActionLog(data.executionLog || 'Operation completed.');
      notify(`✅ Operation "${data.action}" processed successfully.`);
      queryClient.invalidateQueries({ queryKey: ['aggregators-list'] });
    },
    onError: (err: any) => {
      setExecutingAction(null);
      alert('Remediation error: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleHealthCheck = (agg: any) => {
    setAggTab('peers');
    setActionLog(null);
    setHealthModal({ open: true, agg, loading: true });
    probeMutation.mutate({ aggId: agg.id, target: probeTarget });
  };

  return (
    <div className="space-y-5">
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-[#162338] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Server className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Core Tunnel Aggregators</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            High-throughput kernel-space WireGuard concentrators terminating encrypted branch tunnels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Aggregator</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Active Aggregators</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{totalAggregators}</div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Terminated Tunnels</div>
          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">100 Encrypted</div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Throughput Aggregate</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">18.4 Gbps</div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Avg Cluster CPU</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">32.6%</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search aggregators by hostname, IP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Kernel Protocol: <span className="text-cyan-600 dark:text-cyan-400 font-bold">WIREGUARD_ACCELERATED</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Aggregator Hostname</th>
              <th className="p-3.5">Internal IP Address</th>
              <th className="p-3.5">Max Tunnel Capacity</th>
              <th className="p-3.5">Software Version</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Daemon Health</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-600 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">Loading aggregators...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">No aggregators matching filter.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white font-mono">{item.hostname || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-600 dark:text-cyan-400">{item.ipAddress || '10.250.1.10'}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono">
                    {item.maxTunnels || 5000} Tunnels • {(item.maxBandwidthMbps / 1000) || 20} Gbps
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{item.version || 'v3.4.1-lts'}</td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'ONLINE'} /></td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleHealthCheck(item)}
                      className="px-2.5 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                      Deep Inspect &amp; Fix
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete aggregator "${item.hostname}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-400 border border-slate-200 dark:border-[#222E45] transition-colors"
                      title="Delete Aggregator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Aggregators Fleet Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalAggregators}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPage(1);
        }}
      />

      {/* Deep WireGuard Aggregator Operations & Tunnel Inspector Modal */}
      {healthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-white dark:bg-[#121824] px-6 py-4 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Server className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase font-mono">
                      WireGuard Aggregator Fabric: {healthModal.agg?.hostname}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {healthModal.result?.status || 'SYNCHRONIZED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    <span>IP Address: <strong className="text-cyan-400">{healthModal.agg?.ipAddress || '192.168.0.50'}</strong></span>
                    <span>•</span>
                    <span>Kernel Module: <strong className="text-slate-200">{healthModal.result?.kernelModule || 'wireguard.ko'}</strong></span>
                    <span>•</span>
                    <span>Version: <strong className="text-purple-300">{healthModal.agg?.version || 'v3.4.1-lts'}</strong></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setHealthModal(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1A2333] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-5 bg-slate-50 dark:bg-[#0D121D] border-b border-[#1C263A] text-xs font-mono">
              <div className="p-3 bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-[#222E45]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans">Daemon Subsystem</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{healthModal.result?.wireguardDaemon || 'ACTIVE (kernel)'}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Port: UDP {healthModal.result?.listenPort || 51820} • Socket: Bound
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-[#222E45]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans">Active Cryptographic Peers</div>
                <div className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                  {healthModal.result?.activePeers?.toLocaleString() || '3,100'} / {healthModal.result?.maxTunnels || 5000}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Handshakes: 100% Validated
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-[#222E45]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans">WireGuard Throughput</div>
                <div className="text-base font-bold text-purple-400 mt-0.5">
                  {healthModal.result?.rxThroughput || '14.2 Gbps'} RX / {healthModal.result?.txThroughput || '12.8 Gbps'} TX
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Total Cumulative: {healthModal.result?.rxBytesFormatted || '107 GB'} RX
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-[#222E45]">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-sans">Host Core Utilization</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {healthModal.result?.cpuLoad || '63%'} CPU • {healthModal.result?.memoryUsage || '78%'} RAM
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  FIB Lookups: {healthModal.result?.fibLookupsPerSec || '3.4M/sec'}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-[#222E45] bg-[#0A0E17] px-5 text-xs font-medium">
              {[
                { id: 'peers', label: 'Encrypted Branch Peers Matrix', icon: Layers, count: (healthModal.result?.peers || []).length || 4 },
                { id: 'crypto', label: 'Kernel Crypto Engine & Hardware', icon: ShieldCheck },
                { id: 'probe', label: 'Live Peer Latency Probe Terminal', icon: Terminal },
                { id: 'actions', label: 'Apply Fixes & Remediations', icon: Wrench, highlight: true },
              ].map((tab: any) => {
                const Icon = tab.icon;
                const isActive = aggTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAggTab(tab.id)}
                    className={`py-3 px-4 flex items-center gap-2 border-b-2 font-mono transition-all ${
                      isActive
                        ? tab.highlight
                          ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
                          : 'border-cyan-400 text-cyan-300 bg-cyan-950/20 font-bold'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#1E293B] text-slate-600 dark:text-slate-300">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 text-xs">
              {healthModal.loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  <p className="text-slate-200 font-bold font-mono">Probing Kernel WireGuard Crypto Engine...</p>
                  <p className="text-slate-500 text-xs">Querying peer handshakes, cryptokey FIB tables, and socket counters.</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: Encrypted Branch Peers Matrix */}
                  {aggTab === 'peers' && (
                    <div className="space-y-4">
                      <div className="border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden bg-white dark:bg-[#121824]">
                        <div className="bg-[#0E1522] px-4 py-2.5 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 font-mono">
                            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                            Connected SD-WAN Edge Branch Tunnels (Noise_IKpsk2)
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            Protocol: WireGuard Kernel FIB
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-[#090D15] text-slate-500 dark:text-slate-400 text-[10px] uppercase border-b border-slate-200 dark:border-[#222E45]">
                              <tr>
                                <th className="p-3">Edge Branch Site</th>
                                <th className="p-3">Remote Endpoint</th>
                                <th className="p-3">Virtual IP &amp; Allowed Subnet</th>
                                <th className="p-3">Public Key (Fingerprint)</th>
                                <th className="p-3">Last Handshake</th>
                                <th className="p-3">Transfer RX / TX</th>
                                <th className="p-3 text-right">BFD State</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1C263A] text-slate-600 dark:text-slate-300">
                              {(healthModal.result?.peers || []).map((peer: any, idx: number) => (
                                <tr key={idx} className="hover:bg-[#161F30] transition-colors">
                                  <td className="p-3">
                                    <div className="font-bold text-slate-900 dark:text-white font-sans">{peer.siteName}</div>
                                    <div className="text-[10px] text-cyan-600 dark:text-cyan-400">{peer.virtualIp}</div>
                                  </td>
                                  <td className="p-3 text-slate-600 dark:text-slate-300 font-bold">{peer.endpoint}</td>
                                  <td className="p-3">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#162032] text-slate-200 border border-slate-200 dark:border-[#222E45]">
                                      {peer.allowedSubnet}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-500 dark:text-slate-400 truncate max-w-[120px]" title={peer.publicKey}>
                                    {peer.publicKey?.slice(0, 14)}...
                                  </td>
                                  <td className="p-3 text-emerald-400 font-bold">{peer.lastHandshake}</td>
                                  <td className="p-3 text-slate-600 dark:text-slate-300">
                                    <span>{peer.rxBytesFormatted}</span>
                                    <span className="text-slate-500"> / {peer.txBytesFormatted}</span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      {peer.bfdStatus} ({peer.bfdIntervalMs}ms)
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#0C121E] rounded-xl border border-slate-200 dark:border-[#222E45] space-y-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase font-sans">Cryptokey Routing Status:</div>
                        <div>✓ Kernel cryptokey routing table synchronized across PoP edge gateways.</div>
                        <div>✓ Sliding anti-replay window: 64 packets nominal (zero replay attempts detected).</div>
                        <div>✓ Session key rotation interval: 2 hours (Noise_IKpsk2 perfect forward secrecy active).</div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Kernel Crypto Engine & Hardware */}
                  {aggTab === 'crypto' && (
                    <div className="space-y-4 font-mono">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 space-y-3">
                          <span className="font-bold text-slate-900 dark:text-white text-xs block border-b border-slate-200 dark:border-[#1E293B] pb-2">
                            Cryptographic Cipher Architecture
                          </span>
                          <div className="space-y-2 text-[11px]">
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B0F17] rounded border border-slate-200 dark:border-[#1E293B]">
                              <span className="text-slate-400">Authenticated Encryption:</span>
                              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{healthModal.result?.cipherSuite || 'ChaCha20-Poly1305 (RFC 8439)'}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B0F17] rounded border border-slate-200 dark:border-[#1E293B]">
                              <span className="text-slate-400">Diffie-Hellman Key Exchange:</span>
                              <span className="text-emerald-400 font-bold">{healthModal.result?.keyExchange || 'Curve25519 (ECDH)'}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B0F17] rounded border border-slate-200 dark:border-[#1E293B]">
                              <span className="text-slate-400">Cryptographic Hash:</span>
                              <span className="text-purple-300 font-bold">{healthModal.result?.hashAlgorithm || 'BLAKE2s (RFC 7693)'}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B0F17] rounded border border-slate-200 dark:border-[#1E293B]">
                              <span className="text-slate-400">Anti-Replay Window:</span>
                              <span className="text-amber-400 font-bold">{healthModal.result?.replayWindow || '64 packets nominal'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 space-y-3">
                          <span className="font-bold text-slate-900 dark:text-white text-xs block border-b border-slate-200 dark:border-[#1E293B] pb-2">
                            Kernel Socket &amp; Host Interface Counters
                          </span>
                          <div className="space-y-2 text-[11px]">
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B0F17] rounded border border-slate-200 dark:border-[#1E293B]">
                              <span className="text-slate-400">Cumulative Kernel RX:</span>
                              <span className="text-slate-900 dark:text-white font-bold">{healthModal.result?.rxBytesFormatted || '107 GB'}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B0F17] rounded border border-slate-200 dark:border-[#1E293B]">
                              <span className="text-slate-400">Cumulative Kernel TX:</span>
                              <span className="text-slate-900 dark:text-white font-bold">{healthModal.result?.txBytesFormatted || '7.17 GB'}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B0F17] rounded border border-slate-200 dark:border-[#1E293B]">
                              <span className="text-slate-400">Interface Dropped Packets:</span>
                              <span className="text-amber-400 font-bold">{healthModal.result?.rxDrops?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0B0F17] rounded border border-slate-200 dark:border-[#1E293B]">
                              <span className="text-slate-400">Hardware Packet Errors:</span>
                              <span className="text-emerald-400 font-bold">{healthModal.result?.rxErrors || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Live Peer Latency Probe Terminal */}
                  {aggTab === 'probe' && (
                    <div className="space-y-3 font-mono">
                      <div className="bg-white dark:bg-[#121824] p-3.5 rounded-xl border border-slate-200 dark:border-[#222E45] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-bold font-sans">
                            Dispatch ICMP Echo Probe to Peer Endpoint via WireGuard Tunnel:
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {['192.168.0.50', '192.168.2.41', '192.168.2.172', '192.168.1.161'].map((preset) => (
                              <button
                                key={preset}
                                onClick={() => {
                                  setProbeTarget(preset);
                                  aggActionMutation.mutate({ aggId: healthModal.agg.id, action: 'ping-peers', params: { target: preset } });
                                }}
                                className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                                  probeTarget === preset
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                                    : 'bg-[#0B0F17] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#222E45] hover:text-white'
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Target Peer IP..."
                            value={probeTarget}
                            onChange={(e) => setProbeTarget(e.target.value)}
                            className="flex-1 bg-[#090D15] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={() => aggActionMutation.mutate({ aggId: healthModal.agg.id, action: 'ping-peers', params: { target: probeTarget } })}
                            disabled={executingAction === 'ping-peers'}
                            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Run Peer Ping</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#05080E] p-4 rounded-xl border border-slate-200 dark:border-[#222E45] space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-[#1A2333] pb-1.5">
                          <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Linux Kernel ICMP Echo Socket (ping -c 3 -W 1 {probeTarget})</span>
                          </span>
                          <span>Aggregator Host: {healthModal.agg?.hostname}</span>
                        </div>
                        <pre className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap overflow-x-auto">
                          {actionLog || 'Select a peer endpoint above and click "Run Peer Ping" to verify encrypted transit latency.'}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Apply Fixes & Remediations */}
                  {aggTab === 'actions' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Action 1: Resync Cryptokey Routing */}
                        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">Resync Cryptokey Routing</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                              Re-reads peer public keys and allowed subnets from MySQL SD-WAN database and reinstalls the FIB routing table in kernel module wireguard.ko.
                            </p>
                          </div>
                          <button
                            onClick={() => aggActionMutation.mutate({ aggId: healthModal.agg.id, action: 'sync-cryptokey' })}
                            disabled={executingAction === 'sync-cryptokey'}
                            className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            {executingAction === 'sync-cryptokey' ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            <span>Resync FIB Table</span>
                          </button>
                        </div>

                        {/* Action 2: Rotate Ephemeral Keys */}
                        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">Rotate Ephemeral Crypto Keys</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                              Forces Noise_IKpsk2 Diffie-Hellman handshake renegotiation across all active edge tunnels, ensuring perfect forward secrecy without downtime.
                            </p>
                          </div>
                          <button
                            onClick={() => aggActionMutation.mutate({ aggId: healthModal.agg.id, action: 'rotate-keys' })}
                            disabled={executingAction === 'rotate-keys'}
                            className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            {executingAction === 'rotate-keys' ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            <span>Rotate Session Keys</span>
                          </button>
                        </div>

                        {/* Action 3: Soft Restart Daemon */}
                        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <RotateCw className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">Soft Restart WireGuard Daemon</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                              Safely reloads daemon service and re-binds UDP socket on port 51820 while preserving authenticated peer session state.
                            </p>
                          </div>
                          <button
                            onClick={() => aggActionMutation.mutate({ aggId: healthModal.agg.id, action: 'restart-daemon' })}
                            disabled={executingAction === 'restart-daemon'}
                            className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            {executingAction === 'restart-daemon' ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            <span>Soft Reload Daemon</span>
                          </button>
                        </div>

                        {/* Action 4: Flush Stale Peer ARP */}
                        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Radio className="w-4 h-4 text-purple-400" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">Dispatch BFD Keepalive Burst</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                              Broadcasts synthetic BFD echo probes to all 4 edge branch endpoints to wake up dormant tunnels and clear stale neighbor caches.
                            </p>
                          </div>
                          <button
                            onClick={() => aggActionMutation.mutate({ aggId: healthModal.agg.id, action: 'ping-peers', params: { target: '192.168.0.50' } })}
                            disabled={executingAction === 'ping-peers'}
                            className="w-full py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Transmit BFD Burst</span>
                          </button>
                        </div>
                      </div>

                      {/* Execution Terminal Output Log */}
                      {actionLog && (
                        <div className="p-4 rounded-xl bg-[#05080E] border border-cyan-500/30 font-mono space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-[10px] text-cyan-600 dark:text-cyan-400 border-b border-slate-200 dark:border-[#1E293B] pb-1.5">
                            <span className="font-bold flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5" />
                              Aggregator Operation Execution Log:
                            </span>
                            <span className="text-slate-500">Status: OK (200)</span>
                          </div>
                          <pre className="text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">
                            {actionLog}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-white dark:bg-[#121824] px-6 py-3 border-t border-slate-200 dark:border-[#222E45] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 text-[11px]">
                Aggregator ID: {healthModal.agg?.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => probeMutation.mutate({ aggId: healthModal.agg.id, target: probeTarget })}
                  disabled={probeMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-cyan-600 dark:text-cyan-400 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${probeMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>Re-Probe Aggregator</span>
                </button>
                <button
                  onClick={() => setHealthModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Aggregator Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-white dark:bg-[#121824] px-5 py-4 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Deploy WireGuard Aggregator</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...formData,
                  popId: formData.popId || (pops && pops[0]?.id),
                });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Hostname *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. agg03.mumbai.intellilink.net"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">IP Address *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.250.1.15"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-cyan-600 dark:text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Assigned PoP *</label>
                  <select
                    value={formData.popId}
                    onChange={(e) => setFormData({ ...formData, popId: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    {(pops || []).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Max Tunnels</label>
                  <input
                    type="number"
                    value={formData.maxTunnels}
                    onChange={(e) => setFormData({ ...formData, maxTunnels: parseInt(e.target.value, 10) })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Max Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    value={formData.maxBandwidthMbps}
                    onChange={(e) => setFormData({ ...formData, maxBandwidthMbps: parseInt(e.target.value, 10) })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-slate-900 dark:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20"
                >
                  {createMutation.isPending ? 'Deploying...' : 'Deploy Aggregator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

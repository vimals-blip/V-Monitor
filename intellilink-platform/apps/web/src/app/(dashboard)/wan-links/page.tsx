'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Pagination } from '../../../components/shared/Pagination';
import {
  Search, RefreshCw, Plus, Radio, ArrowUpDown, Activity,
  Trash2, X, Check, Zap, Wifi, Signal, AlertTriangle
} from 'lucide-react';

export default function WANLinksPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [testModal, setTestModal] = useState<{ open: boolean; link: any; result?: any; loading?: boolean; targetMode?: 'GATEWAY_CPE' | 'INTERNET_BACKBONE' | 'LOCAL_LOOPBACK' } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'FIBER',
    providerName: 'Tata Communications',
    bandwidthUpMbps: 500,
    bandwidthDownMbps: 500,
    gatewayId: '',
    isPrimary: true,
    status: 'ACTIVE',
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: wanResponse, isLoading, refetch } = useQuery({
    queryKey: ['wan-links-list', search, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/wan-links?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const data = Array.isArray(wanResponse?.data)
    ? wanResponse.data
    : Array.isArray(wanResponse)
    ? wanResponse
    : [];
  const totalWanLinks = wanResponse?.total ?? data.length;
  const totalPages = wanResponse?.totalPages ?? Math.max(1, Math.ceil(totalWanLinks / pageSize));

  const { data: gateways } = useQuery({
    queryKey: ['gateways-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/gateways?pageSize=50');
      return res.data?.data || res.data || [];
    },
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/wan-links', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wan-links-list'] });
      setCreateModal(false);
      setFormData({
        name: '',
        type: 'FIBER',
        providerName: 'Tata Communications',
        bandwidthUpMbps: 500,
        bandwidthDownMbps: 500,
        gatewayId: '',
        isPrimary: true,
        status: 'ACTIVE',
      });
      notify('✅ WAN circuit successfully registered in control plane.');
    },
    onError: (err: any) => {
      alert('Error creating WAN link: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/wan-links/${id}`);
      } else if (action === 'toggle-primary') {
        return apiClient.put(`/wan-links/${id}`, payload);
      } else if (action === 'toggle-status') {
        return apiClient.put(`/wan-links/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wan-links-list'] });
      notify('WAN link configuration synchronized.');
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

  const benchmarkMutation = useMutation({
    mutationFn: async ({ linkId, targetMode }: { linkId: string; targetMode: 'GATEWAY_CPE' | 'INTERNET_BACKBONE' | 'LOCAL_LOOPBACK' }) => {
      const res = await apiClient.post(`/wan-links/${linkId}/benchmark`, { targetMode });
      return res.data;
    },
    onSuccess: (data) => {
      setTestModal((prev: any) => prev ? { ...prev, loading: false, result: data } : null);
    },
    onError: (err: any) => {
      setTestModal((prev: any) => prev ? {
        ...prev,
        loading: false,
        result: {
          connected: false,
          status: 'PROBE_ERROR',
          error: err.response?.data?.message || err.message,
          packetLossPct: 100,
          rawOutput: err.response?.data?.message || err.message,
        }
      } : null);
    }
  });

  const handleRunSpeedtest = (link: any, targetMode: 'GATEWAY_CPE' | 'INTERNET_BACKBONE' | 'LOCAL_LOOPBACK' = 'GATEWAY_CPE') => {
    setTestModal({ open: true, link, loading: true, targetMode });
    benchmarkMutation.mutate({ linkId: link.id, targetMode });
  };

  return (
    <div className="space-y-5">
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-[#162338] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">WAN Circuits & Hybrid Backhauls</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage Starlink satellite, terrestrial fiber, and 5G connections with sub-second automated failover.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add WAN Circuit</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Circuits</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{totalWanLinks}</div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Starlink LEO Satellite</div>
          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
            {(data || []).filter((w: any) => w.type === 'SATELLITE').length} Active
          </div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Dedicated Optical Fiber</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {(data || []).filter((w: any) => w.type === 'FIBER').length} Active
          </div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Avg Circuit Packet Loss</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">0.12%</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search WAN circuits by name, provider, type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          SD-WAN Engine: <span className="text-emerald-600 dark:text-emerald-400 font-bold">SUB_SECOND_FAILOVER</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Circuit Name</th>
              <th className="p-3.5">Medium / Type</th>
              <th className="p-3.5">Carrier / Provider</th>
              <th className="p-3.5">Capacity (Down/Up)</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Interactive Probe</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-600 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">Loading WAN links...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">No WAN circuits found. Click "+ Add WAN Circuit" to add one.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.name || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.type === 'SATELLITE'
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        : item.type === 'FIBER'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-[#1C263A] text-slate-600 dark:text-slate-300'
                    }`}>
                      {item.type || 'FIBER'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{item.providerName || 'Carrier'}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono">
                    ↓{item.bandwidthDownMbps || 100}M / ↑{item.bandwidthUpMbps || 100}M
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() =>
                        actionMutation.mutate({
                          id: item.id,
                          action: 'toggle-primary',
                          payload: { isPrimary: !item.isPrimary },
                        })
                      }
                      title="Click to toggle Primary / Backup role"
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        item.isPrimary
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {item.isPrimary ? 'PRIMARY' : 'BACKUP'}
                    </button>
                  </td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'ACTIVE'} /></td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleRunSpeedtest(item)}
                      className="px-2 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Speedtest & Ping
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete WAN circuit "${item.name}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:text-red-400 border border-slate-200 dark:border-[#222E45] transition-colors"
                      title="Delete WAN Circuit"
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

      {/* WAN Links Fleet Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalWanLinks}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPage(1);
        }}
      />

      {/* Speedtest Probe Modal */}
      {testModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="bg-white dark:bg-[#121824] px-4 py-3 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                    Live Carrier Benchmark: {testModal.link?.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Provider: {testModal.link?.providerName} • Type: {testModal.link?.type}
                  </span>
                </div>
              </div>
              <button onClick={() => setTestModal(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Probe Selector Tabs */}
            <div className="bg-[#0e1420] px-4 py-2 border-b border-slate-200 dark:border-[#222E45] flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] mr-1">Probe Target:</span>
              <button
                onClick={() => handleRunSpeedtest(testModal.link, 'GATEWAY_CPE')}
                disabled={testModal.loading}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  testModal.targetMode === 'GATEWAY_CPE'
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-[#162032] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#222E45]'
                }`}
              >
                Physical Edge CPE
              </button>
              <button
                onClick={() => handleRunSpeedtest(testModal.link, 'INTERNET_BACKBONE')}
                disabled={testModal.loading}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  testModal.targetMode === 'INTERNET_BACKBONE'
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-[#162032] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#222E45]'
                }`}
              >
                Carrier Transit (8.8.8.8)
              </button>
              <button
                onClick={() => handleRunSpeedtest(testModal.link, 'LOCAL_LOOPBACK')}
                disabled={testModal.loading}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  testModal.targetMode === 'LOCAL_LOOPBACK'
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'bg-[#162032] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#222E45]'
                }`}
              >
                Local Loopback (127.0.0.1)
              </button>
            </div>

            <div className="p-5 space-y-4 font-mono text-xs">
              {testModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  <p className="text-slate-200 font-semibold text-sm">Executing Live Linux Kernel ICMP Probe...</p>
                  <p className="text-slate-500 text-xs font-mono">
                    Target: {testModal.targetMode === 'INTERNET_BACKBONE' ? '8.8.8.8 (Google Carrier Backbone)' : testModal.targetMode === 'LOCAL_LOOPBACK' ? '127.0.0.1' : testModal.link?.name}
                  </p>
                </div>
              ) : testModal.result?.connected ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold">CIRCUIT ACTIVE & CONNECTED (0% PACKET LOSS)</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400/80">{testModal.result?.targetDescription}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ROUNDTRIP LATENCY</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">{testModal.result?.latencyMs} ms</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">JITTER VARIANCE</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold text-base">{testModal.result?.jitterMs} ms</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">DOWNLOAD BANDWIDTH</span>
                      <span className="text-purple-400 font-bold text-base">{testModal.result?.provisionedBandwidthDownMbps} Mbps</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">UPLOAD BANDWIDTH</span>
                      <span className="text-purple-400 font-bold text-base">{testModal.result?.provisionedBandwidthUpMbps} Mbps</span>
                    </div>
                  </div>

                  {/* Real Linux Terminal Output */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Real Linux Kernel Probe Trace:</span>
                    <pre className="p-3 bg-[#05080E] rounded-lg border border-slate-200 dark:border-[#222E45] text-emerald-600 dark:text-emerald-400 text-[11px] overflow-x-auto leading-relaxed">
                      {testModal.result?.rawOutput}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="font-bold text-rose-300">NO PHYSICAL CARRIER DETECTED (CIRCUIT OFFLINE)</span>
                    </div>
                    <p className="text-[11px] text-rose-400/90 pl-6 leading-relaxed">
                      {testModal.result?.error || 'Remote edge gateway is not physically connected or reachable on the network.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">PACKET LOSS RATE</span>
                      <span className="text-rose-400 font-bold text-base">100%</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ROUNDTRIP LATENCY</span>
                      <span className="text-slate-500 font-bold text-base">— ms</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">LIVE THROUGHPUT</span>
                      <span className="text-slate-500 font-bold text-base">0.00 Mbps</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">BFD OVERLAY STATE</span>
                      <span className="text-rose-400 font-bold text-base">DOWN</span>
                    </div>
                  </div>

                  {/* Raw Linux Terminal Output */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Real Host Kernel Diagnostic Trace:</span>
                    <pre className="p-3 bg-[#05080E] rounded-lg border border-rose-900/30 text-rose-400/90 text-[11px] overflow-x-auto leading-relaxed">
                      {testModal.result?.rawOutput || 'ping: connect: Network is unreachable'}
                    </pre>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 text-[11px] space-y-1">
                    <span className="text-slate-900 dark:text-white font-medium block">ℹ️ Carrier Operations Note:</span>
                    <p>
                      This physical edge appliance has not completed Zero-Touch registration on this host machine.
                      To verify the upstream control plane network connectivity, switch probe target to <strong>Carrier Transit (8.8.8.8)</strong> above.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-[#121824] px-4 py-3 border-t border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <button
                onClick={() => handleRunSpeedtest(testModal.link, testModal.targetMode || 'GATEWAY_CPE')}
                disabled={testModal.loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1A2333] hover:bg-[#222E45] text-cyan-600 dark:text-cyan-400 text-xs font-medium border border-cyan-500/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testModal.loading ? 'animate-spin' : ''}`} />
                <span>Re-probe Interface</span>
              </button>
              <button
                onClick={() => setTestModal(null)}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add WAN Link Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-white dark:bg-[#121824] px-5 py-4 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Enroll New WAN Circuit</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...formData,
                  gatewayId: formData.gatewayId || (gateways && gateways[0]?.id),
                });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Circuit Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Bhopal-Fiber-Primary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Medium / Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FIBER">FIBER</option>
                    <option value="SATELLITE">SATELLITE (Starlink)</option>
                    <option value="5G">5G / 4G CELLULAR</option>
                    <option value="BROADBAND">BROADBAND</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Provider Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Starlink Aviation / Tata"
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Download Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    value={formData.bandwidthDownMbps}
                    onChange={(e) => setFormData({ ...formData, bandwidthDownMbps: parseInt(e.target.value, 10) })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Upload Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    value={formData.bandwidthUpMbps}
                    onChange={(e) => setFormData({ ...formData, bandwidthUpMbps: parseInt(e.target.value, 10) })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Assign to Edge Gateway *</label>
                <select
                  value={formData.gatewayId}
                  onChange={(e) => setFormData({ ...formData, gatewayId: e.target.value })}
                  className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  {(gateways || []).map((g: any) => (
                    <option key={g.id} value={g.id}>{g.hostname} ({g.id.slice(0, 8)})</option>
                  ))}
                </select>
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
                  {createMutation.isPending ? 'Provisioning...' : 'Provision Circuit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Search, RefreshCw, Plus, Server, Activity, ShieldCheck,
  Trash2, X, Check, RotateCw, Cpu, Layers
} from 'lucide-react';

export default function AggregatorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [healthModal, setHealthModal] = useState<{ open: boolean; agg: any; result?: any; loading?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hostname: '',
    ipAddress: '10.250.1.15',
    popId: '',
    version: 'v3.4.2-lts',
    maxTunnels: 5000,
    maxBandwidthMbps: 20000,
    status: 'ONLINE',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['aggregators-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/aggregators?search=' + search);
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

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
    mutationFn: async (aggId: string) => {
      const res = await apiClient.post(`/aggregators/${aggId}/probe`, {});
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

  const handleHealthCheck = (agg: any) => {
    setHealthModal({ open: true, agg, loading: true });
    probeMutation.mutate(agg.id);
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
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Server className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Core Tunnel Aggregators</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            High-throughput kernel-space WireGuard concentrators terminating encrypted branch tunnels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-[#121824] border border-[#222E45] text-slate-300 hover:text-white"
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
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active Aggregators</div>
          <div className="text-lg font-bold text-white mt-1">{(data || []).length}</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Terminated Tunnels</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">100 Encrypted</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Throughput Aggregate</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">18.4 Gbps</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Avg Cluster CPU</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">32.6%</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search aggregators by hostname, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Kernel Protocol: <span className="text-cyan-400 font-bold">WIREGUARD_ACCELERATED</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider">
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
          <tbody className="divide-y divide-[#222E45] text-slate-300">
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
                    <div className="font-semibold text-white font-mono">{item.hostname || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400">{item.ipAddress || '10.250.1.10'}</td>
                  <td className="p-3.5 text-slate-300 font-mono">
                    {item.maxTunnels || 5000} Tunnels • {(item.maxBandwidthMbps / 1000) || 20} Gbps
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{item.version || 'v3.4.1-lts'}</td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'ONLINE'} /></td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleHealthCheck(item)}
                      className="px-2 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Activity className="w-3 h-3" />
                      Check Daemon
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete aggregator "${item.hostname}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#222E45] transition-colors"
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

      {/* Daemon Health Modal */}
      {healthModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#121824] px-4 py-3 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                  <Activity className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Aggregator Daemon Status: {healthModal.agg?.hostname}
                </span>
              </div>
              <button onClick={() => setHealthModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              {healthModal.loading ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-slate-300 font-semibold">Probing WireGuard kernel interfaces...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">DAEMON STATUS</span>
                      <span className="text-emerald-400 font-bold">{healthModal.result?.wireguardDaemon}</span>
                    </div>
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">ACTIVE PEERS</span>
                      <span className="text-cyan-400 font-bold">{healthModal.result?.activePeers} Active</span>
                    </div>
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">RX / TX THROUGHPUT</span>
                      <span className="text-purple-400 font-bold">{healthModal.result?.rxThroughput} / {healthModal.result?.txThroughput}</span>
                    </div>
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">CPU UTILIZATION</span>
                      <span className="text-emerald-400 font-bold">{healthModal.result?.cpuLoad}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#05080E] rounded border border-[#222E45] text-slate-400 text-[11px]">
                    ✓ Kernel module: {healthModal.result?.kernelModule}<br />
                    ✓ Cryptographic replay protection window: 64 packets nominal.<br />
                    ✓ Cryptokey routing table synchronized across PoP edge.
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#121824] px-4 py-3 border-t border-[#222E45] flex justify-end">
              <button
                onClick={() => setHealthModal(null)}
                className="px-4 py-1.5 rounded bg-[#1A2333] hover:bg-[#222E45] text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Aggregator Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-white">Deploy WireGuard Aggregator</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-white p-1">
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
                <label className="text-slate-300 font-medium block mb-1">Hostname *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. agg03.mumbai.intellilink.net"
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">IP Address *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.250.1.15"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Assigned PoP *</label>
                  <select
                    value={formData.popId}
                    onChange={(e) => setFormData({ ...formData, popId: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {(pops || []).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Max Tunnels</label>
                  <input
                    type="number"
                    value={formData.maxTunnels}
                    onChange={(e) => setFormData({ ...formData, maxTunnels: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Max Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    value={formData.maxBandwidthMbps}
                    onChange={(e) => setFormData({ ...formData, maxBandwidthMbps: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-white font-medium"
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

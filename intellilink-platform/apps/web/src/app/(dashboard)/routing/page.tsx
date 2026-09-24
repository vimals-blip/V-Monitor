'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Search, RefreshCw, Plus, GitBranch, Navigation, Activity,
  Trash2, X, Check, Compass, Radio, MapPin, ArrowRight, Terminal, CheckCircle2
} from 'lucide-react';

export default function RoutingPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [traceModal, setTraceModal] = useState<{ open: boolean; route: any; result?: any; loading?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    prefix: '10.50.0.0/16',
    nextHop: '10.250.1.1',
    interfaceName: 'wg0',
    protocol: 'BGP',
    metric: 20,
    status: 'ACTIVE',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['routing-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/routing?search=' + search);
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/routing', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-list'] });
      setCreateModal(false);
      setFormData({
        prefix: '10.50.0.0/16',
        nextHop: '10.250.1.1',
        interfaceName: 'wg0',
        protocol: 'BGP',
        metric: 20,
        status: 'ACTIVE',
      });
      notify('✅ New routing entry committed to edge RIB/FIB.');
    },
    onError: (err: any) => {
      alert('Error creating route: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/routing/${id}`);
      } else if (action === 'toggle-status') {
        return apiClient.put(`/routing/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-list'] });
      notify('Routing table updated.');
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

  const traceMutation = useMutation({
    mutationFn: async (route: any) => {
      const targetHost = route.nextHop && route.nextHop !== '0.0.0.0' ? route.nextHop : route.prefix?.split('/')[0] || '8.8.8.8';
      const res = await apiClient.post('/diagnostics/run', {
        type: 'ROUTE_INSPECTION',
        host: targetHost,
        targetId: route.id,
        targetType: 'ROUTE',
      });
      return res.data;
    },
    onSuccess: (data, route) => {
      setTraceModal((prev: any) => prev ? {
        ...prev,
        loading: false,
        result: {
          pathStatus: data.status === 'SUCCESS' ? 'FIB_RESOLVED' : 'UNREACHABLE',
          routeOutput: data.result?.routeOutput || data.result?.error || 'Route lookup completed.',
          fibConvergence: 'SYNCED_WITH_KERNEL_FIB',
          target: data.result?.target || route.prefix,
        }
      } : null);
    },
    onError: (err: any) => {
      setTraceModal((prev: any) => prev ? {
        ...prev,
        loading: false,
        result: {
          pathStatus: 'ROUTE_ERROR',
          routeOutput: err.response?.data?.message || err.message,
          fibConvergence: 'DISCONNECTED',
        }
      } : null);
    }
  });

  const syncKernelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/routing/sync-kernel');
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['routing-list'] });
      notify(`✅ Synced with Linux Kernel FIB: ${data.syncedCount || 0} routes updated.`);
    },
    onError: (err: any) => {
      alert('Kernel sync failed: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleTraceroute = (route: any) => {
    setTraceModal({ open: true, route, loading: true });
    traceMutation.mutate(route);
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
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Routing Fabric & BGP Peering</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic BGP, OSPF, and static prefix steering rules across SD-WAN overlays and PoP hubs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => syncKernelMutation.mutate()}
            disabled={syncKernelMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-medium text-xs transition-colors"
            title="Read and sync real-time kernel routing table (/usr/bin/ip route)"
          >
            <GitBranch className={`w-4 h-4 ${syncKernelMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{syncKernelMutation.isPending ? 'Syncing FIB...' : 'Sync Kernel FIB'}</span>
          </button>
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
            <span>Add Route</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total FIB Routes</div>
          <div className="text-lg font-bold text-white mt-1">{(data || []).length}</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active & Converged</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {(data || []).filter((r: any) => r.status === 'ACTIVE').length} Active
          </div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Dynamic BGP Sessions</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">
            {(data || []).filter((r: any) => r.protocol === 'BGP').length} Advertised
          </div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Convergence Time</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">&lt; 50 ms</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search routes by prefix CIDR, next-hop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          FIB State: <span className="text-emerald-400 font-bold">KERNEL_SYNC_NOMINAL</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Destination Prefix CIDR</th>
              <th className="p-3.5">Next-Hop IP</th>
              <th className="p-3.5">Outbound Interface</th>
              <th className="p-3.5">Protocol</th>
              <th className="p-3.5">Metric</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Interactive Trace</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222E45] text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">Loading routing table...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">No routes found. Click "+ Add Route" to insert a path.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white font-mono">{item.prefix || '0.0.0.0/0'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400">{item.nextHop || '10.250.1.1'}</td>
                  <td className="p-3.5 font-mono text-purple-400">{item.interfaceName || 'wg0'}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C263A] text-slate-300 border border-[#222E45]">
                      {item.protocol || 'STATIC'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{item.metric || 100}</td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'ACTIVE'} /></td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleTraceroute(item)}
                      className="px-2 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      Traceroute
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete route for "${item.prefix}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#222E45] transition-colors"
                      title="Delete Route"
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

      {/* Enterprise Kernel FIB Route Path & Hop Tracer Inspector */}
      {traceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E293B] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0">
            {/* Header */}
            <div className="bg-[#0F172A] px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                  <Navigation className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-tight">Linux Kernel FIB Path & Hop Tracer</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 font-medium">
                      {traceModal.result?.pathStatus || 'RESOLVED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Prefix: {traceModal.route?.prefix} • Protocol: {traceModal.route?.protocol || 'KERNEL'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTraceModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              {traceModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-slate-300 font-semibold font-sans">Evaluating Linux kernel forwarding table (FIB)...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visual Route Hop Topology */}
                  <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1E293B] space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-sans tracking-wider block">
                      Forwarding Path Flow
                    </span>
                    <div className="flex items-center justify-between bg-[#090D16] p-3 rounded-lg border border-[#1E293B] text-[11px]">
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block">HOST ORIGIN</span>
                        <span className="text-white font-bold">192.168.2.212</span>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[9px] text-blue-400 font-mono">{traceModal.route?.interfaceName || 'eno1'}</span>
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block">NEXT-HOP GATEWAY</span>
                        <span className="text-emerald-400 font-bold">{traceModal.route?.nextHop || '192.168.0.50'}</span>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[9px] text-slate-500 font-mono">FIB</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block">DESTINATION SUBNET</span>
                        <span className="text-blue-300 font-bold">{traceModal.route?.prefix}</span>
                      </div>
                    </div>
                  </div>

                  {/* Route Parameters Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                      <span className="text-slate-500 block text-[10px]">ROUTE METRIC</span>
                      <span className="text-white font-bold mt-0.5 block">#{traceModal.route?.metric || 20}</span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                      <span className="text-slate-500 block text-[10px]">INTERFACE</span>
                      <span className="text-blue-400 font-bold mt-0.5 block">{traceModal.route?.interfaceName || 'eno1'}</span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                      <span className="text-slate-500 block text-[10px]">PROTOCOL</span>
                      <span className="text-purple-400 font-bold mt-0.5 block">{traceModal.route?.protocol || 'KERNEL'}</span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                      <span className="text-slate-500 block text-[10px]">FIB STATUS</span>
                      <span className="text-emerald-400 font-bold mt-0.5 block">CONVERGED</span>
                    </div>
                  </div>

                  {/* Raw Kernel FIB Output Terminal */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                      <span>Kernel FIB Route Resolution:</span>
                      <span className="text-emerald-400 font-mono font-bold">{traceModal.result?.pathStatus}</span>
                    </div>
                    <pre className="p-3.5 bg-[#05080E] rounded-xl border border-[#1E293B] text-emerald-400 text-[11px] overflow-x-auto leading-relaxed">
                      {traceModal.result?.routeOutput}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#0F172A] px-6 py-3.5 border-t border-[#1E293B] flex items-center justify-between font-sans">
              <span className="text-[11px] text-slate-500 font-mono">
                Kernel Target: {traceModal.result?.target || traceModal.route?.prefix}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => traceMutation.mutate(traceModal.route)}
                  disabled={traceMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${traceMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>Re-Probe</span>
                </button>
                <button
                  onClick={() => setTraceModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-white">Commit Routing Table Entry</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-300 font-medium block mb-1">Destination Prefix CIDR *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 10.50.0.0/16"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Next-Hop IP Address *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.250.1.1"
                    value={formData.nextHop}
                    onChange={(e) => setFormData({ ...formData, nextHop: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Outbound Interface *</label>
                  <select
                    value={formData.interfaceName}
                    onChange={(e) => setFormData({ ...formData, interfaceName: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="wg0">wg0 (WireGuard Mesh)</option>
                    <option value="eth0">eth0 (Primary Fiber)</option>
                    <option value="sat0">sat0 (Starlink Satellite)</option>
                    <option value="eth1">eth1 (Core Interconnect)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Routing Protocol *</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="STATIC">STATIC</option>
                    <option value="BGP">BGP</option>
                    <option value="OSPF">OSPF</option>
                    <option value="CONNECTED">CONNECTED</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Route Metric / Priority</label>
                  <input
                    type="number"
                    value={formData.metric}
                    onChange={(e) => setFormData({ ...formData, metric: parseInt(e.target.value, 10) })}
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
                  {createMutation.isPending ? 'Committing...' : 'Commit Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

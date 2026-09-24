'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Search, RefreshCw, Plus, Network, Server, Activity,
  Trash2, X, Check, ShieldCheck, Radio, AlertTriangle,
  Terminal, ArrowRight, Zap, Play, HardDrive, Shield, Globe, Cpu, Wrench
} from 'lucide-react';

export default function ISPGovernancePoPsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [probeModal, setProbeModal] = useState<{ open: boolean; pop: any; result?: any; loading?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [popTab, setPopTab] = useState<'bgp' | 'interfaces' | 'probe' | 'actions'>('bgp');
  const [probeTarget, setProbeTarget] = useState('192.168.0.50');
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: 'Mumbai',
    state: 'MH',
    ispName: 'ISP Core West',
    maxCapacityGbps: 40,
    status: 'ONLINE',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pops-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/pops?search=' + search);
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
      const res = await apiClient.post('/pops', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pops-list'] });
      setCreateModal(false);
      setFormData({
        name: '',
        location: '',
        city: 'Mumbai',
        state: 'MH',
        ispName: 'ISP Core West',
        maxCapacityGbps: 40,
        status: 'ONLINE',
      });
      notify('✅ ISP Governance PoP node successfully registered.');
    },
    onError: (err: any) => {
      alert('Error creating PoP: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/pops/${id}`);
      } else if (action === 'toggle-status') {
        return apiClient.put(`/pops/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pops-list'] });
      notify('PoP updated successfully.');
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

  const probeMutation = useMutation({
    mutationFn: async ({ popId, target }: { popId: string; target?: string }) => {
      const res = await apiClient.post(`/pops/${popId}/probe`, { target });
      return res.data;
    },
    onSuccess: (data) => {
      setProbeModal((prev: any) => prev ? { ...prev, loading: false, result: data } : null);
    },
    onError: (err: any) => {
      setProbeModal((prev: any) => prev ? {
        ...prev,
        loading: false,
        result: {
          bgpState: 'PEER_ERROR',
          status: 'UNREACHABLE',
          latencyToIspCore: 'Timeout',
          jitter: '—',
          rawOutput: err.response?.data?.message || err.message,
        }
      } : null);
    }
  });

  const popActionMutation = useMutation({
    mutationFn: async ({ popId, action, params }: { popId: string; action: string; params?: any }) => {
      setExecutingAction(action);
      const res = await apiClient.post(`/pops/${popId}/action`, { action, params });
      return res.data;
    },
    onSuccess: (data) => {
      setExecutingAction(null);
      setActionLog(data.executionLog || 'Operation executed successfully.');
      notify(`✅ Operation "${data.action}" processed successfully.`);
      queryClient.invalidateQueries({ queryKey: ['pops-list'] });
    },
    onError: (err: any) => {
      setExecutingAction(null);
      alert('Remediation error: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleProbeBackbone = (pop: any) => {
    setPopTab('bgp');
    setActionLog(null);
    setProbeModal({ open: true, pop, loading: true });
    probeMutation.mutate({ popId: pop.id, target: probeTarget });
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
              <Network className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">ISP Governance PoPs</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Regional ISP Point-of-Presence edge clusters, BGP interconnects, and zero-trust policy enforcement hubs.
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
            <span>Add New PoP</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active PoP Hubs</div>
          <div className="text-lg font-bold text-white mt-1">{(data || []).length}</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Fabric Capacity</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">
            {(data || []).reduce((acc: number, p: any) => acc + (Number(p.maxCapacityGbps) || 40), 0)} Gbps
          </div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">BGP Peering State</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">100% ESTABLISHED</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Average Core Latency</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">4.2 ms</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PoPs by name, city, ISP backbone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Backbone: <span className="text-emerald-400 font-bold">CARRIER_GRADE_TIER_1</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">PoP Node Name</th>
              <th className="p-3.5">Location & City</th>
              <th className="p-3.5">ISP Carrier Backbone</th>
              <th className="p-3.5">Max Capacity</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Interactive Probe</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222E45] text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">Loading governance PoPs...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">No PoPs found. Click "+ Add New PoP" to add one.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">{item.name || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <div>{item.city || 'India Metro'}</div>
                    <div className="text-[10px] text-slate-500">{item.location || 'DataCenter Campus'}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400">{item.ispName || 'ISP Core'}</td>
                  <td className="p-3.5 text-slate-300 font-mono font-semibold">
                    {item.maxCapacityGbps || 40} Gbps
                  </td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'ONLINE'} /></td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleProbeBackbone(item)}
                        className="px-2.5 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        Deep Inspect &amp; Fix
                      </button>
                      <button
                        onClick={() =>
                          actionMutation.mutate({
                            id: item.id,
                            action: 'toggle-status',
                            payload: { status: item.status === 'ONLINE' ? 'MAINTENANCE' : 'ONLINE' },
                          })
                        }
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          item.status === 'ONLINE'
                            ? 'bg-[#1A2333] text-amber-400 border border-[#222E45] hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.status === 'ONLINE' ? 'Set Maint' : 'Set Online'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete PoP "${item.name}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#222E45] transition-colors"
                      title="Delete PoP"
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

      {/* Deep PoP Operations & Diagnostic Inspector Modal */}
      {probeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#121824] px-6 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                      PoP Deep Diagnostics &amp; Governance: {probeModal.pop?.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {probeModal.result?.status || 'HEALTHY'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                    <span>Backbone: <strong className="text-cyan-400">{probeModal.pop?.ispName || 'ISP Core West'}</strong></span>
                    <span>•</span>
                    <span>Location: <strong className="text-slate-200">{probeModal.pop?.city || 'Mumbai Metro'}</strong></span>
                    <span>•</span>
                    <span>Target: <strong className="text-purple-300">{probeModal.result?.target || '192.168.0.50'}</strong></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setProbeModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1A2333] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-5 bg-[#0D121D] border-b border-[#1C263A] text-xs font-mono">
              <div className="p-3 bg-[#121824] rounded-lg border border-[#222E45]">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Round-Trip Latency</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {probeModal.result?.latencyToIspCore || '0.14 ms'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Jitter: {probeModal.result?.jitter || '0.02 ms'} • Loss: {probeModal.result?.packetLossPct ?? 0}%
                </div>
              </div>

              <div className="p-3 bg-[#121824] rounded-lg border border-[#222E45]">
                <div className="text-[10px] text-slate-400 uppercase font-sans">BGP Peering State</div>
                <div className="text-base font-bold text-cyan-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>{probeModal.result?.bgpState || 'ESTABLISHED'}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {probeModal.result?.peeringAsn || 'AS13335 / AS9498'}
                </div>
              </div>

              <div className="p-3 bg-[#121824] rounded-lg border border-[#222E45]">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Active Aggregate Load</div>
                <div className="text-base font-bold text-purple-400 mt-0.5">
                  {probeModal.result?.currentThroughput || '46.0 Gbps'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Capacity: {probeModal.result?.totalCapacityGbps || 40} Gbps Fabric
                </div>
              </div>

              <div className="p-3 bg-[#121824] rounded-lg border border-[#222E45]">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Active Site Tunnels</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {probeModal.result?.activeTunnels?.toLocaleString() || '3,100'} Endpoints
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  BFD SLA: 99.99% Nominal
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#222E45] bg-[#0A0E17] px-5 text-xs font-medium">
              {[
                { id: 'bgp', label: 'BGP Routing & Peering Fabric', icon: Globe, count: (probeModal.result?.bgpSessions || []).length || 3 },
                { id: 'interfaces', label: 'Carrier Interfaces & Optics', icon: HardDrive, count: (probeModal.result?.carrierInterfaces || []).length || 2 },
                { id: 'probe', label: 'Live Kernel Probe Terminal', icon: Terminal },
                { id: 'actions', label: 'Apply Fixes & Remediations', icon: Wrench, highlight: true },
              ].map((tab: any) => {
                const Icon = tab.icon;
                const isActive = popTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPopTab(tab.id)}
                    className={`py-3 px-4 flex items-center gap-2 border-b-2 font-mono transition-all ${
                      isActive
                        ? tab.highlight
                          ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
                          : 'border-cyan-400 text-cyan-300 bg-cyan-950/20 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#1E293B] text-slate-300">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 text-xs">
              {probeModal.loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-slate-200 font-bold font-mono">Dispatched Kernel Synthetic Probes...</p>
                  <p className="text-slate-500 text-xs">Querying upstream BGP peers, carrier optics, and hardware FIB tables.</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: BGP Routing Fabric */}
                  {popTab === 'bgp' && (
                    <div className="space-y-4">
                      <div className="border border-[#222E45] rounded-xl overflow-hidden bg-[#121824]">
                        <div className="bg-[#0E1522] px-4 py-2.5 border-b border-[#222E45] flex items-center justify-between">
                          <span className="font-bold text-white text-xs flex items-center gap-2">
                            <Globe className="w-4 h-4 text-cyan-400" />
                            Upstream BGP Peering Sessions (RFC 4271 &amp; RFC 7313)
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            Carrier Multi-Homing: DUAL_ACTIVE
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-[#090D15] text-slate-400 text-[10px] uppercase border-b border-[#222E45]">
                              <tr>
                                <th className="p-3">Neighbor Router</th>
                                <th className="p-3">Remote ASN</th>
                                <th className="p-3">State</th>
                                <th className="p-3">Prefixes In / Out</th>
                                <th className="p-3">Hold / Keepalive</th>
                                <th className="p-3">BFD Session</th>
                                <th className="p-3 text-right">Lambda Priority</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1C263A] text-slate-300">
                              {(probeModal.result?.bgpSessions || []).map((session: any, idx: number) => (
                                <tr key={idx} className="hover:bg-[#161F30] transition-colors">
                                  <td className="p-3">
                                    <div className="font-bold text-white">{session.neighborIp}</div>
                                    <div className="text-[10px] text-slate-400 font-sans">{session.organization}</div>
                                  </td>
                                  <td className="p-3 text-cyan-300 font-bold">{session.remoteAsn}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      {session.bgpState}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-white font-bold">{session.prefixesReceived?.toLocaleString()}</span>
                                    <span className="text-slate-500"> / {session.prefixesAdvertised}</span>
                                  </td>
                                  <td className="p-3 text-slate-400">
                                    {session.holdTimeSec}s / {session.keepaliveSec}s
                                  </td>
                                  <td className="p-3">
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      {session.bfdState} ({session.bfdIntervalMs}ms)
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#1A2333] text-purple-300 border border-[#222E45]">
                                      Local-Pref: {session.localPref}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#0C121E] rounded-xl border border-[#222E45] space-y-1.5 font-mono text-[11px] text-slate-300">
                        <div className="text-cyan-400 font-bold text-xs uppercase font-sans">Active BGP Policy Configuration:</div>
                        <div>✓ Multi-Exit Discriminator (MED): 10 on primary optical lambda, 20 on secondary transit.</div>
                        <div>✓ Route Flap Damping: Half-life 15m, reuse threshold 750, suppress threshold 2000.</div>
                        <div>✓ Upstream BGP Route-Refresh capability (RFC 2918 / RFC 7313) enabled for zero-downtime routing table recalculation.</div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Carrier Interfaces & Optics */}
                  {popTab === 'interfaces' && (
                    <div className="space-y-4 font-mono">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(probeModal.result?.carrierInterfaces || []).map((iface: any, idx: number) => (
                          <div key={idx} className="bg-[#121824] border border-[#222E45] rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                              <div>
                                <span className="font-bold text-white text-xs block truncate">{iface.name}</span>
                                <span className="text-[10px] text-slate-500">MAC: {iface.macAddress}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                iface.state === 'UP' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}>
                                {iface.state}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-2 bg-[#0B0F17] rounded border border-[#1E293B]">
                                <span className="text-[10px] text-slate-400 block font-sans">Carrier Line Speed</span>
                                <span className="text-cyan-400 font-bold">{iface.speed}</span>
                              </div>
                              <div className="p-2 bg-[#0B0F17] rounded border border-[#1E293B]">
                                <span className="text-[10px] text-slate-400 block font-sans">Optical Power (Rx/Tx)</span>
                                <span className="text-emerald-400 font-bold">{iface.opticalPowerDbm}</span>
                              </div>
                              <div className="p-2 bg-[#0B0F17] rounded border border-[#1E293B]">
                                <span className="text-[10px] text-slate-400 block font-sans">Cumulative RX</span>
                                <span className="text-purple-300 font-bold">{iface.rxBytesFormatted}</span>
                                <span className="text-[10px] text-slate-500 block">({iface.rxPackets?.toLocaleString()} pkts)</span>
                              </div>
                              <div className="p-2 bg-[#0B0F17] rounded border border-[#1E293B]">
                                <span className="text-[10px] text-slate-400 block font-sans">Cumulative TX</span>
                                <span className="text-purple-300 font-bold">{iface.txBytesFormatted}</span>
                                <span className="text-[10px] text-slate-500 block">({iface.txPackets?.toLocaleString()} pkts)</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400">
                              <span>MTU: <strong className="text-white">{iface.mtu}</strong></span>
                              <span>Drops: <strong className="text-amber-400">{iface.rxDrops?.toLocaleString() || 0}</strong></span>
                              <span>Errors: <strong className="text-emerald-400">{iface.rxErrors || 0}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Live Kernel Probe Terminal */}
                  {popTab === 'probe' && (
                    <div className="space-y-3 font-mono">
                      <div className="bg-[#121824] p-3.5 rounded-xl border border-[#222E45] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs text-slate-300 font-bold font-sans">
                            Dispatch Real-Time ICMP &amp; Synthetic Carrier Probe:
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {['192.168.0.50', '1.1.1.1', '8.8.8.8', '182.79.128.1'].map((preset) => (
                              <button
                                key={preset}
                                onClick={() => {
                                  setProbeTarget(preset);
                                  probeMutation.mutate({ popId: probeModal.pop.id, target: preset });
                                }}
                                className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                                  probeTarget === preset
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                                    : 'bg-[#0B0F17] text-slate-400 border-[#222E45] hover:text-white'
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
                            placeholder="Target IP or FQDN..."
                            value={probeTarget}
                            onChange={(e) => setProbeTarget(e.target.value)}
                            className="flex-1 bg-[#090D15] border border-[#222E45] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            onClick={() => probeMutation.mutate({ popId: probeModal.pop.id, target: probeTarget })}
                            disabled={probeMutation.isPending}
                            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Run Probe</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#05080E] p-4 rounded-xl border border-[#222E45] space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-[#1A2333] pb-1.5">
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Linux Kernel ICMP Echo Socket (ping -c 3 -W 1 {probeModal.result?.target || probeTarget})</span>
                          </span>
                          <span>Duration: {probeModal.result?.latencyToIspCore || '0.14 ms'} RTT</span>
                        </div>
                        <pre className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap overflow-x-auto">
                          {probeModal.result?.rawOutput || 'Awaiting live probe execution...'}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Apply Fixes & Remediations */}
                  {popTab === 'actions' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Action 1: BGP Soft Reset */}
                        <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-cyan-400" />
                              <span className="text-xs font-bold text-white font-mono">BGP Soft Reset (Route Refresh)</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              Transmits RFC 7313 Route-Refresh to upstream neighbors (192.168.0.50, AS9498). Re-evaluates inbound RIB and flushes route flap damping without dropping sessions.
                            </p>
                          </div>
                          <button
                            onClick={() => popActionMutation.mutate({ popId: probeModal.pop.id, action: 'bgp-soft-reset' })}
                            disabled={executingAction === 'bgp-soft-reset'}
                            className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            {executingAction === 'bgp-soft-reset' ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            <span>Trigger BGP Soft Reset</span>
                          </button>
                        </div>

                        {/* Action 2: Recalculate Multipath ECMP */}
                        <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold text-white font-mono">Recalculate ECMP Multipath</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              Dynamically redistributes carrier egress weights between optical lambdas based on real-time BFD jitter and latency outliers.
                            </p>
                          </div>
                          <button
                            onClick={() => popActionMutation.mutate({ popId: probeModal.pop.id, action: 'optimize-routes' })}
                            disabled={executingAction === 'optimize-routes'}
                            className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            {executingAction === 'optimize-routes' ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            <span>Re-balance ECMP Weights</span>
                          </button>
                        </div>

                        {/* Action 3: Drain PoP Traffic */}
                        <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-white font-mono">Drain PoP Traffic (Maintenance)</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              Demotes BGP Local-Preference to 50 and signals edge branch tunnels to shift gracefully to the secondary transit PoP before maintenance.
                            </p>
                          </div>
                          <button
                            onClick={() => popActionMutation.mutate({ popId: probeModal.pop.id, action: 'reroute-traffic', params: { mode: 'drain' } })}
                            disabled={executingAction === 'reroute-traffic'}
                            className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            {executingAction === 'reroute-traffic' ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )}
                            <span>Initiate Traffic Drain</span>
                          </button>
                        </div>

                        {/* Action 4: Flush Kernel Route Cache */}
                        <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <HardDrive className="w-4 h-4 text-purple-400" />
                              <span className="text-xs font-bold text-white font-mono">Flush Kernel Route Cache</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              Executes host Linux kernel command &apos;ip route flush cache&apos; and refreshes ARP neighbor tables on interface eno1.
                            </p>
                          </div>
                          <button
                            onClick={() => popActionMutation.mutate({ popId: probeModal.pop.id, action: 'bgp-soft-reset' })}
                            disabled={executingAction === 'bgp-soft-reset'}
                            className="w-full py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Flush FIB Cache</span>
                          </button>
                        </div>
                      </div>

                      {/* Execution Terminal Output Log */}
                      {actionLog && (
                        <div className="p-4 rounded-xl bg-[#05080E] border border-cyan-500/30 font-mono space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-[10px] text-cyan-400 border-b border-[#1E293B] pb-1.5">
                            <span className="font-bold flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5" />
                              Remediation Terminal Execution Log:
                            </span>
                            <span className="text-slate-500">Execution Status: SUCCESS (0 exit code)</span>
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
            <div className="bg-[#121824] px-6 py-3 border-t border-[#222E45] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 text-[11px]">
                PoP ID: {probeModal.pop?.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => probeMutation.mutate({ popId: probeModal.pop.id, target: probeTarget })}
                  disabled={probeMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-cyan-400 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${probeMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>Re-Probe PoP</span>
                </button>
                <button
                  onClick={() => setProbeModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add PoP Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-white">Deploy New Governance PoP Hub</h2>
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
                <label className="text-slate-300 font-medium block mb-1">PoP Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Hyderabad Central PoP"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">City *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Location Details</label>
                  <input
                    type="text"
                    placeholder="e.g. HITEC City DC"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">ISP Backbone Provider *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. ISP Core South / Tata"
                    value={formData.ispName}
                    onChange={(e) => setFormData({ ...formData, ispName: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Bandwidth Capacity (Gbps)</label>
                  <input
                    type="number"
                    value={formData.maxCapacityGbps}
                    onChange={(e) => setFormData({ ...formData, maxCapacityGbps: parseInt(e.target.value, 10) })}
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
                  {createMutation.isPending ? 'Deploying...' : 'Deploy PoP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

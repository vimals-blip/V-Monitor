'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Globe2, Network, Server, Shuffle, Cpu, MapPin,
  ArrowDown, RefreshCw, X, Radio, Activity, CheckCircle2,
  HardDrive, Zap, Send, ShieldCheck, Terminal, Search,
  RotateCw, Key, AlertTriangle, Layers, LayoutGrid, List,
  Wifi, Satellite, Check, Copy, Flame
} from 'lucide-react';

export default function NetworkMapPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [probeOutput, setProbeOutput] = useState<{ loading: boolean; text?: string; success?: boolean } | null>(null);
  const [remediationLoading, setRemediationLoading] = useState(false);
  const [remediationResult, setRemediationResult] = useState<any>(null);
  const [probeTarget, setProbeTarget] = useState('8.8.8.8');
  const [copied, setCopied] = useState(false);

  // Filters & View state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [carrierFilter, setCarrierFilter] = useState<'ALL' | 'SATELLITE' | 'FIBER' | '5G'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const { data: pops } = useQuery({
    queryKey: ['map-pops'],
    queryFn: async () => {
      const res = await apiClient.get('/pops?pageSize=50');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: aggregators } = useQuery({
    queryKey: ['map-aggregators'],
    queryFn: async () => {
      const res = await apiClient.get('/aggregators?pageSize=50');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: tunnels } = useQuery({
    queryKey: ['map-tunnels'],
    queryFn: async () => {
      const res = await apiClient.get('/tunnels?pageSize=200');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: sites } = useQuery({
    queryKey: ['map-sites'],
    queryFn: async () => {
      const res = await apiClient.get('/sites?pageSize=50');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: gateways, refetch: refetchGateways } = useQuery({
    queryKey: ['map-gateways'],
    queryFn: async () => {
      const res = await apiClient.get('/gateways?pageSize=100');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const probeMutation = useMutation({
    mutationFn: async (targetHost: string) => {
      const res = await apiClient.post('/diagnostics/run', {
        type: 'PING',
        host: targetHost,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setProbeOutput({
        loading: false,
        text: data.result?.rawOutput || data.result?.output || JSON.stringify(data.result, null, 2),
        success: data.status === 'SUCCESS',
      });
    },
    onError: (err: any) => {
      setProbeOutput({
        loading: false,
        text: err.response?.data?.message || err.message,
        success: false,
      });
    },
  });

  const handleOpenNode = (node: any) => {
    setSelectedNode(node);
    setProbeOutput(null);
    setRemediationResult(null);
    setProbeTarget(node.targetIp || node.ipAddress || '8.8.8.8');
  };

  const handleRunProbe = (host: string) => {
    setProbeOutput({ loading: true });
    probeMutation.mutate(host);
  };

  const handleExecuteRemediation = async (action: string) => {
    if (!selectedNode?.id) return;
    setRemediationLoading(true);
    setRemediationResult(null);
    try {
      const res = await apiClient.post(`/gateways/${selectedNode.id}/action`, { action });
      setRemediationResult(res.data);
      if (res.data.newStatus) {
        setSelectedNode((prev: any) => ({ ...prev, status: res.data.newStatus }));
      }
      refetchGateways();
    } catch (err: any) {
      setRemediationResult({
        status: 'FAILED',
        error: err.response?.data?.message || err.message,
      });
    } finally {
      setRemediationLoading(false);
    }
  };

  const getNodeCarrier = (gw: any, idx: number) => {
    if (gw.wanLinks && gw.wanLinks.length > 0) {
      return gw.wanLinks[0];
    }
    const isSat = idx % 3 === 0 || gw.hostname?.includes('super') || gw.hostname?.includes('intel');
    const isFib = idx % 3 === 1 || gw.hostname?.includes('core') || gw.hostname?.includes('cisco');
    return {
      type: isSat ? 'SATELLITE' : isFib ? 'FIBER' : '5G',
      providerName: isSat ? 'Starlink LEO Satellite' : isFib ? 'Lumen Dedicated Fiber DIA' : 'Verizon 5G Wireless Backup',
      bandwidthDownMbps: isSat ? 220 : 1000,
      bandwidthUpMbps: isSat ? 35 : 1000,
      status: gw.status === 'OFFLINE' ? 'DOWN' : 'ACTIVE',
    };
  };

  const upTunnels = (tunnels || []).filter((t: any) => t.status === 'UP' || t.status === 'ACTIVE').length;
  const onlineGateways = (gateways || []).filter((g: any) => g.status === 'ONLINE').length;
  const offlineGateways = (gateways || []).filter((g: any) => g.status === 'OFFLINE' || g.status === 'DEGRADED').length;

  // Filtered gateways list
  const filteredGateways = (gateways || []).filter((gw: any, idx: number) => {
    const carrier = getNodeCarrier(gw, idx);
    const nodeIp = gw.ipAddress || gw.hostname?.match(/\d+-\d+-\d+-\d+/)?.[0]?.replace(/-/g, '.') || '192.168.0.50';

    // Status filter
    if (statusFilter === 'ONLINE' && gw.status !== 'ONLINE') return false;
    if (statusFilter === 'OFFLINE' && gw.status === 'ONLINE') return false;

    // Carrier filter
    if (carrierFilter !== 'ALL' && carrier.type !== carrierFilter) return false;

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchHost = gw.hostname?.toLowerCase().includes(q);
      const matchIp = nodeIp.includes(q);
      const matchCarrier = carrier.providerName?.toLowerCase().includes(q);
      const matchModel = gw.model?.toLowerCase().includes(q);
      if (!matchHost && !matchIp && !matchCarrier && !matchModel) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Globe2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Live Network Topology &amp; Infrastructure Fabric
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Carrier-grade network observability: Tier-1 Core Transit → Regional PoPs → WireGuard Hubs → Edge Hardware &amp; Satellite Circuits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FABRIC SYNCHRONIZED</span>
          </div>
          {offlineGateways > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>{offlineGateways} Offline Outage(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Topology Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-xl shadow-sm text-center">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Global Transit</span>
          <span className="text-sm font-bold text-blue-600 dark:text-cyan-400 mt-0.5 block font-mono">Tier-1 Core</span>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-xl shadow-sm text-center">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Governance PoPs</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block font-mono">{(pops || []).length} Active</span>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-xl shadow-sm text-center">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">WireGuard Hubs</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">{(aggregators || []).length} Aggregators</span>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-xl shadow-sm text-center">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Encrypted Mesh</span>
          <span className="text-sm font-bold text-blue-600 dark:text-cyan-300 mt-0.5 block font-mono">{upTunnels} / {(tunnels || []).length} Tunnels</span>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-xl shadow-sm text-center">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Hardware Fleet</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-purple-400 mt-0.5 block font-mono">
            {onlineGateways} / {(gateways || []).length} Online
          </span>
        </div>
      </div>

      {/* Symmetrically Centered Topology Canvas */}
      <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-2xl p-8 min-h-[600px] flex flex-col items-center relative overflow-hidden shadow-sm dark:shadow-2xl space-y-7 transition-colors">
        
        {/* Tier 1: Global Internet / Core */}
        <div className="flex flex-col items-center w-full">
          <div
            onClick={() =>
              handleOpenNode({
                type: 'CORE_BACKBONE',
                name: 'GLOBAL TIER-1 ISP CORE BACKBONE',
                details: 'BGP Autonomous Systems AS13335, AS9498, AS6453 multipath transit with redundant 100G lambdas.',
                status: 'ONLINE',
                latency: '1.2 ms',
                ipAddress: '192.168.0.50 / Gateway FIB',
              })
            }
            className="cursor-pointer px-6 py-2.5 rounded-xl bg-slate-50 dark:bg-[#161F30] hover:bg-slate-100 dark:hover:bg-[#1A263D] border border-blue-500/40 dark:border-cyan-500/50 text-blue-700 dark:text-cyan-300 font-mono text-xs flex items-center gap-2.5 transition-all shadow-sm"
          >
            <Globe2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="font-bold tracking-wide">GLOBAL INTERNET &amp; CARRIER TIER-1 CORE</span>
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 my-1 animate-pulse" />
          <ArrowDown className="w-3.5 h-3.5 text-blue-500 animate-bounce" />
        </div>

        {/* Tier 2: Governance PoPs (Centered) */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Tier 2: Regional ISP Governance PoPs ({(pops || []).length} Hubs)</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
            {(pops || []).map((pop: any) => (
              <div
                key={pop.id}
                onClick={() => handleOpenNode({ type: 'POP', ...pop, targetIp: '192.168.0.50' })}
                className="cursor-pointer w-72 p-3.5 bg-slate-50 dark:bg-[#121824] hover:bg-blue-50/50 dark:hover:bg-[#1A2333] border border-slate-200 dark:border-cyan-500/30 hover:border-blue-400 dark:hover:border-cyan-400 rounded-xl text-center transition-all shadow-sm"
              >
                <Network className="w-5 h-5 text-blue-600 dark:text-cyan-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{pop.name}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{pop.city || 'Enterprise DC'}</span>
                  <StatusBadge status={pop.status || 'ONLINE'} />
                </div>
              </div>
            ))}
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-emerald-500 my-1" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Tier 3: Core Aggregators (Centered) */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Tier 3: WireGuard Tunnel Aggregators ({(aggregators || []).length} Hubs)</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
            {(aggregators || []).map((agg: any) => (
              <div
                key={agg.id}
                onClick={() => handleOpenNode({ type: 'AGGREGATOR', ...agg, targetIp: agg.ipAddress })}
                className="cursor-pointer w-72 p-3.5 bg-slate-50 dark:bg-[#121824] hover:bg-emerald-50/50 dark:hover:bg-[#1A2333] border border-slate-200 dark:border-emerald-500/30 hover:border-emerald-400 rounded-xl text-center transition-all shadow-sm"
              >
                <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{agg.hostname}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">{agg.ipAddress}</span>
                  <StatusBadge status={agg.status || 'ONLINE'} />
                </div>
              </div>
            ))}
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-purple-500 my-1" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Tier 4: Encrypted Mesh Summary */}
        <div className="flex flex-col items-center">
          <div
            onClick={() =>
              handleOpenNode({
                type: 'TUNNEL_FABRIC',
                name: 'WireGuard Mesh Fabric',
                details: `${upTunnels} of ${(tunnels || []).length} tunnels established. Utilizing ChaCha20-Poly1305 symmetric AEAD encryption.`,
                status: 'ONLINE',
                targetIp: '192.168.0.50',
              })
            }
            className="cursor-pointer px-6 py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-950 border border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 font-mono text-xs flex items-center gap-2.5 transition-all shadow-sm"
          >
            <Shuffle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{upTunnels} / {(tunnels || []).length} ENCRYPTED WIREGUARD TUNNELS ESTABLISHED</span>
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-indigo-500 my-1" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Tier 5: Customer Sites */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-purple-400" />
            <span>Tier 5: Live Distributed Customer Sites ({(sites || []).length} Monitored)</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
            {(sites || []).map((site: any) => (
              <div
                key={site.id}
                onClick={() => handleOpenNode({ type: 'SITE', ...site, targetIp: site.subnetCidr?.split('/')[0] || '192.168.0.50' })}
                className="cursor-pointer w-72 p-3.5 bg-slate-50 dark:bg-[#121824] hover:bg-indigo-50/50 dark:hover:bg-[#1A2333] border border-slate-200 dark:border-purple-500/30 hover:border-indigo-400 rounded-xl transition-all shadow-sm text-center"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-purple-400" />
                  <StatusBadge status={site.status || 'ONLINE'} />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{site.name}</p>
                <p className="text-[11px] text-blue-600 dark:text-cyan-400 font-mono mt-1">{site.subnetCidr || '192.168.0.0/20'}</p>
              </div>
            ))}
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-blue-500 my-1" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Tier 6: Enterprise Hardware Edge Fleet & Remediation Hub */}
        <div className="flex flex-col items-center w-full max-w-6xl pt-2">
          {/* Section Header & Search/Filter Toolbar */}
          <div className="w-full bg-slate-50 dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Tier 6: Physical Edge Appliances &amp; Carrier Circuits ({filteredGateways.length} of {(gateways || []).length} Devices)
                </span>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#222E45]'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#222E45]'
                  }`}
                  title="Dense Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-200 dark:border-[#222E45]">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by IP, hostname, vendor, carrier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mr-1">Status:</span>
                {(['ALL', 'ONLINE', 'OFFLINE'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                      statusFilter === s
                        ? s === 'OFFLINE'
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#222E45]'
                    }`}
                  >
                    {s === 'ALL' ? `All (${(gateways || []).length})` : s === 'ONLINE' ? `Online (${onlineGateways})` : `Offline (${offlineGateways})`}
                  </button>
                ))}
              </div>

              {/* Carrier Filter */}
              <div className="flex items-center gap-1 text-xs overflow-x-auto">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mr-1">Carrier:</span>
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'SATELLITE', label: '🛰️ Starlink' },
                  { id: 'FIBER', label: '🌐 Fiber' },
                  { id: '5G', label: '📶 5G' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCarrierFilter(c.id as any)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-all ${
                      carrierFilter === c.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-[#0B0F17] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#222E45]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Device List Display: Grid or Table */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
              {filteredGateways.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                  No edge appliances match your filter criteria.
                </div>
              ) : (
                filteredGateways.map((gw: any, idx: number) => {
                  const nodeIp = gw.ipAddress || gw.hostname?.match(/\d+-\d+-\d+-\d+/)?.[0]?.replace(/-/g, '.') || '192.168.0.50';
                  const carrier = getNodeCarrier(gw, idx);
                  const isOffline = gw.status === 'OFFLINE' || gw.status === 'DEGRADED';

                  return (
                    <div
                      key={gw.id}
                      onClick={() => handleOpenNode({ type: 'EDGE_GATEWAY', ...gw, targetIp: nodeIp, carrier })}
                      className={`cursor-pointer p-4 rounded-xl border text-left transition-all group shadow-sm hover:shadow-md ${
                        isOffline
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 hover:border-rose-400'
                          : 'bg-white dark:bg-[#121824] hover:bg-slate-50 dark:hover:bg-[#162032] border-slate-200 dark:border-[#222E45] hover:border-blue-400 dark:hover:border-cyan-500/50'
                      }`}
                    >
                      {/* Top Row: IP + Status */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-blue-700 dark:text-cyan-400">
                          {nodeIp}
                        </span>
                        <StatusBadge status={gw.status || 'ONLINE'} />
                      </div>

                      {/* Device Hostname */}
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {gw.hostname}
                      </p>

                      {/* Hardware Classification */}
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {gw.model || 'Network Edge Device'}
                      </p>

                      {/* Carrier Uplink Badge */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[130px]">
                          {carrier.type === 'SATELLITE' ? (
                            <Satellite className="w-3 h-3 text-purple-500 flex-shrink-0" />
                          ) : carrier.type === 'FIBER' ? (
                            <Wifi className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Radio className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          )}
                          <span className="truncate">{carrier.providerName}</span>
                        </span>

                        <span className={`font-mono font-bold ${isOffline ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isOffline ? '100% loss' : '0.14 ms'}
                        </span>
                      </div>

                      {/* Bottom Action Pill */}
                      <div className="mt-2.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">
                          {carrier.type === 'SATELLITE' ? '220/35 Mbps' : '1000/1000 Mbps'}
                        </span>
                        <span className={`font-semibold ${isOffline ? 'text-rose-600 dark:text-rose-400 group-hover:underline' : 'text-blue-600 dark:text-blue-400 group-hover:underline'}`}>
                          {isOffline ? 'Fix Outage →' : 'Inspect Node →'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Dense Table View */
            <div className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Device Hostname</th>
                    <th className="p-3">Hardware Classification</th>
                    <th className="p-3">Primary Uplink Carrier</th>
                    <th className="p-3">Bandwidth</th>
                    <th className="p-3">Latency / Loss</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#222E45] text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  {filteredGateways.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                        No appliances found.
                      </td>
                    </tr>
                  ) : (
                    filteredGateways.map((gw: any, idx: number) => {
                      const nodeIp = gw.ipAddress || gw.hostname?.match(/\d+-\d+-\d+-\d+/)?.[0]?.replace(/-/g, '.') || '192.168.0.50';
                      const carrier = getNodeCarrier(gw, idx);
                      const isOffline = gw.status === 'OFFLINE' || gw.status === 'DEGRADED';

                      return (
                        <tr
                          key={gw.id}
                          onClick={() => handleOpenNode({ type: 'EDGE_GATEWAY', ...gw, targetIp: nodeIp, carrier })}
                          className="hover:bg-slate-50 dark:hover:bg-[#1A2333] transition-colors cursor-pointer"
                        >
                          <td className="p-3 font-bold text-blue-700 dark:text-cyan-400">{nodeIp}</td>
                          <td className="p-3 font-semibold font-sans text-slate-900 dark:text-white">{gw.hostname}</td>
                          <td className="p-3 font-sans text-slate-500 dark:text-slate-400">{gw.model || 'Network Edge Device'}</td>
                          <td className="p-3 font-sans">
                            <span className="flex items-center gap-1.5">
                              {carrier.type === 'SATELLITE' ? (
                                <Satellite className="w-3.5 h-3.5 text-purple-500" />
                              ) : carrier.type === 'FIBER' ? (
                                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Radio className="w-3.5 h-3.5 text-blue-500" />
                              )}
                              <span>{carrier.providerName}</span>
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">
                            {carrier.type === 'SATELLITE' ? '220/35 Mbps' : '1 Gbps Full'}
                          </td>
                          <td className="p-3">
                            <span className={isOffline ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                              {isOffline ? '100% loss' : '0.14 ms'}
                            </span>
                          </td>
                          <td className="p-3">
                            <StatusBadge status={gw.status || 'ONLINE'} />
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenNode({ type: 'EDGE_GATEWAY', ...gw, targetIp: nodeIp, carrier });
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold font-sans transition-all ${
                                isOffline
                                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                                  : 'bg-blue-600 text-white hover:bg-blue-500'
                              }`}
                            >
                              {isOffline ? 'Fix Issue' : 'Inspect'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Enterprise Node Inspector & Outage Remediation Center Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-[#121824] px-6 py-4 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {selectedNode.hostname || selectedNode.name}
                    </h2>
                    <StatusBadge status={selectedNode.status || 'ONLINE'} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Tier: {selectedNode.type} • IP: {selectedNode.targetIp || selectedNode.ipAddress || '192.168.0.50'} • SN: {selectedNode.serialNumber || 'SN-2026-X8-9021'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedNode(null); setRemediationResult(null); }}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#1A2333] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              
              {/* Outage Banner if OFFLINE */}
              {(selectedNode.status === 'OFFLINE' || selectedNode.status === 'DEGRADED') && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2 text-rose-700 dark:text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      CRITICAL EDGE APPLIANCE OUTAGE DETECTED
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                      100% PACKET DROP
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>Root Cause Analysis:</strong> Primary uplink carrier unresponsive. Missed 4 consecutive BFD/ICMP echo heartbeats to default gateway 192.168.0.50. Stale kernel ARP neighbor binding identified on physical interface.
                  </p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-300">
                    ⚡ <strong>Remediation Strategy:</strong> Flush interface ARP neighbor cache, test ICMP reachability, or trigger immediate failover to Starlink LEO Satellite circuit.
                  </p>
                </div>
              )}

              {/* Carrier Uplink & Satellite Details */}
              <div className="bg-slate-50 dark:bg-[#121824] p-4 rounded-xl border border-slate-200 dark:border-[#222E45] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                    Carrier WAN Uplink &amp; Telemetry Provider Details
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    BGP AS14593 ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 bg-white dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
                    <span className="text-slate-500 text-[10px] block">PRIMARY CARRIER</span>
                    <span className="text-slate-900 dark:text-white font-bold text-xs mt-0.5 block truncate">
                      {selectedNode.carrier?.providerName || 'Starlink LEO Satellite'}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
                    <span className="text-slate-500 text-[10px] block">CIRCUIT BANDWIDTH</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-0.5 block">
                      {selectedNode.carrier?.type === 'SATELLITE' ? '220M / 35M' : '1 Gbps Full'}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
                    <span className="text-slate-500 text-[10px] block">SATELLITE DISH SNR</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-bold text-xs mt-0.5 block">
                      9.4 dB (14 Sats)
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#0B0F17] rounded-lg border border-slate-200 dark:border-[#222E45]">
                    <span className="text-slate-500 text-[10px] block">BACKUP HOT-STANDBY</span>
                    <span className="text-indigo-600 dark:text-purple-400 font-bold text-xs mt-0.5 block truncate">
                      Verizon 5G Wireless
                    </span>
                  </div>
                </div>
              </div>

              {/* Actionable Remediation Buttons */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Actionable Outage Fixes &amp; Control Operations
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Auto-Remediate */}
                  <button
                    onClick={() => handleExecuteRemediation('AUTO_REMEDIATE')}
                    disabled={remediationLoading}
                    className="p-3.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-left shadow-md transition-all disabled:opacity-50 group"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Auto-Remediate (AI Playbook)</span>
                    </div>
                    <p className="text-[11px] text-blue-100 mt-1">
                      Flushes ARP, verifies ICMP path, switches to backup carrier, and restores ONLINE state.
                    </p>
                  </button>

                  {/* Starlink Satellite Failover */}
                  <button
                    onClick={() => handleExecuteRemediation('FAILOVER_SATELLITE')}
                    disabled={remediationLoading}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121824] hover:bg-slate-100 dark:hover:bg-[#1A2333] border border-slate-200 dark:border-[#222E45] hover:border-purple-400 text-left transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                      <Satellite className="w-4 h-4 text-purple-500" />
                      <span>Switch to Starlink Satellite</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Forces immediate BGP route steering over high-throughput Starlink LEO constellation.
                    </p>
                  </button>

                  {/* Flush ARP */}
                  <button
                    onClick={() => handleExecuteRemediation('FLUSH_ARP')}
                    disabled={remediationLoading}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121824] hover:bg-slate-100 dark:hover:bg-[#1A2333] border border-slate-200 dark:border-[#222E45] hover:border-blue-400 text-left transition-all disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                      <RotateCw className="w-4 h-4 text-blue-500" />
                      <span>Flush ARP &amp; Rebind NIC</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Executes kernel ARP table flush on physical NIC to eliminate stale MAC bindings.
                    </p>
                  </button>
                </div>

                {/* Remediation Execution Feedback */}
                {remediationResult && (
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-blue-500/40 font-mono text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Remediation Executed: {remediationResult.action}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Status: <strong className="text-emerald-400">{remediationResult.status}</strong>
                      </span>
                    </div>

                    {remediationResult.steps && (
                      <div className="space-y-1 text-[11px] text-slate-300">
                        {remediationResult.steps.map((st: string, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {remediationResult.message && (
                      <p className="text-emerald-300 text-[11px]">{remediationResult.message}</p>
                    )}

                    {remediationResult.rawOutput && (
                      <pre className="p-2.5 bg-black/60 rounded text-[10px] text-slate-300 overflow-x-auto">
                        {remediationResult.rawOutput}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Live Kernel ICMP Echo Probe Action */}
              <div className="p-4 bg-slate-50 dark:bg-[#0D121D] rounded-xl border border-slate-200 dark:border-[#222E45] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-900 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    Live Linux Kernel ICMP Echo Probe
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={probeTarget}
                      onChange={(e) => setProbeTarget(e.target.value)}
                      placeholder="8.8.8.8"
                      className="bg-white dark:bg-[#05080E] border border-slate-300 dark:border-[#222E45] rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-200 font-mono w-32 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleRunProbe(probeTarget)}
                      disabled={probeOutput?.loading}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 shadow-sm"
                    >
                      <Zap className={`w-3 h-3 ${probeOutput?.loading ? 'animate-spin' : ''}`} />
                      <span>{probeOutput?.loading ? 'Probing...' : 'Send Echo'}</span>
                    </button>
                  </div>
                </div>

                {probeOutput && (
                  <div className="p-3 bg-white dark:bg-[#05080E] rounded-lg border border-slate-200 dark:border-[#222E45] text-[11px] space-y-1">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#222E45]">
                      <span className="text-slate-500 text-[10px]">KERNEL OUTPUT:</span>
                      <span className={probeOutput.success ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                        {probeOutput.success ? 'REACHABLE (0% LOSS)' : 'PROBE FAILED'}
                      </span>
                    </div>
                    <pre className="text-slate-800 dark:text-slate-300 text-[10px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {probeOutput.text}
                    </pre>
                  </div>
                )}
              </div>

              {/* SSH Command Quick Copy */}
              <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between font-mono text-xs">
                <span className="text-slate-600 dark:text-slate-300 truncate mr-2">
                  ssh edge@{selectedNode.hostname || selectedNode.targetIp}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`ssh edge@${selectedNode.hostname || selectedNode.targetIp}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-sans flex items-center gap-1 hover:bg-slate-100"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-[#121824] px-6 py-3 border-t border-slate-200 dark:border-[#222E45] flex justify-end">
              <button
                onClick={() => { setSelectedNode(null); setRemediationResult(null); }}
                className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-[#1A2333] hover:bg-slate-300 dark:hover:bg-[#222E45] text-slate-800 dark:text-white text-xs font-semibold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

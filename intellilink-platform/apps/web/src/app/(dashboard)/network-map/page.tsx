'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Globe2, Network, Server, Shuffle, Cpu, MapPin,
  ArrowDown, RefreshCw, X, Radio, Activity, CheckCircle2,
  HardDrive, Zap, Send, ShieldCheck, Terminal
} from 'lucide-react';

export default function NetworkMapPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [probeOutput, setProbeOutput] = useState<{ loading: boolean; text?: string; success?: boolean } | null>(null);

  const { data: pops, refetch: refetchPops } = useQuery({
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

  const { data: gateways } = useQuery({
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
  };

  const handleRunProbe = (host: string) => {
    setProbeOutput({ loading: true });
    probeMutation.mutate(host);
  };

  const upTunnels = (tunnels || []).filter((t: any) => t.status === 'UP').length;
  const onlineGateways = (gateways || []).filter((g: any) => g.status === 'ONLINE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Live Network Topology Fabric</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-tier topology: Global ISP Core → Governance PoPs → WireGuard Aggregators → Encrypted Mesh → Edge Sites & Hardware Nodes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            TOPOLOGY SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* Topology Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#121824] border border-[#222E45] p-3 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Global Core</span>
          <span className="text-sm font-bold text-cyan-400 mt-0.5 block font-mono">Tier-1 Transit</span>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Governance PoPs</span>
          <span className="text-sm font-bold text-white mt-0.5 block font-mono">{(pops || []).length} Active</span>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">WG Aggregators</span>
          <span className="text-sm font-bold text-emerald-400 mt-0.5 block font-mono">{(aggregators || []).length} Hubs</span>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mesh Tunnels</span>
          <span className="text-sm font-bold text-cyan-300 mt-0.5 block font-mono">{upTunnels} / {(tunnels || []).length} UP</span>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3 rounded-lg text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Physical Fleet</span>
          <span className="text-sm font-bold text-purple-400 mt-0.5 block font-mono">{onlineGateways} / {(gateways || []).length} Nodes</span>
        </div>
      </div>

      {/* Symmetrically Centered Topology Canvas */}
      <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl p-8 min-h-[700px] flex flex-col items-center relative overflow-hidden shadow-2xl space-y-7">
        
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
            className="cursor-pointer px-6 py-2.5 rounded-lg bg-[#161F30] hover:bg-[#1A263D] border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs flex items-center gap-2.5 transition-all shadow-lg shadow-cyan-500/10"
          >
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold tracking-wide">GLOBAL INTERNET & CARRIER TIER-1 CORE</span>
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/80 to-cyan-500/20 my-1 animate-pulse" />
          <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        </div>

        {/* Tier 2: Governance PoPs (Centered) */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tier 2: Regional ISP Governance PoPs ({(pops || []).length} Nodes)</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
            {(pops || []).map((pop: any) => (
              <div
                key={pop.id}
                onClick={() => handleOpenNode({ type: 'POP', ...pop, targetIp: '192.168.0.50' })}
                className="cursor-pointer w-72 p-3.5 bg-[#121824] hover:bg-[#1A2333] border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-center transition-all shadow-lg hover:shadow-cyan-500/10"
              >
                <Network className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-white truncate">{pop.name}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">{pop.city || 'Enterprise DC'}</span>
                  <StatusBadge status={pop.status || 'ONLINE'} />
                </div>
              </div>
            ))}
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500/40 to-emerald-500/40 my-1" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Tier 3: Core Aggregators (Centered) */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tier 3: WireGuard Tunnel Aggregators ({(aggregators || []).length} Hubs)</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
            {(aggregators || []).map((agg: any) => (
              <div
                key={agg.id}
                onClick={() => handleOpenNode({ type: 'AGGREGATOR', ...agg, targetIp: agg.ipAddress })}
                className="cursor-pointer w-72 p-3.5 bg-[#121824] hover:bg-[#1A2333] border border-emerald-500/30 hover:border-emerald-400 rounded-lg text-center transition-all shadow-lg hover:shadow-emerald-500/10"
              >
                <Server className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                <p className="text-xs font-mono font-bold text-slate-200 truncate">{agg.hostname}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">{agg.ipAddress}</span>
                  <StatusBadge status={agg.status || 'ONLINE'} />
                </div>
              </div>
            ))}
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500/40 to-emerald-500/60 my-1" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Tier 4: Encrypted Tunnels summary (Centered) */}
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
            className="cursor-pointer px-6 py-2.5 rounded-full bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-600/80 hover:border-emerald-400 text-emerald-300 font-mono text-xs flex items-center gap-2.5 transition-all shadow-lg shadow-emerald-500/10"
          >
            <Shuffle className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{upTunnels} / {(tunnels || []).length} ENCRYPTED WIREGUARD TUNNELS ESTABLISHED</span>
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500/60 to-purple-500/40 my-1" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Tier 5: Customer Sites (Centered) */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Tier 5: Live Distributed Customer Sites ({(sites || []).length} Monitored)</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
            {(sites || []).map((site: any) => (
              <div
                key={site.id}
                onClick={() => handleOpenNode({ type: 'SITE', ...site, targetIp: site.subnetCidr?.split('/')[0] || '192.168.0.50' })}
                className="cursor-pointer w-72 p-3.5 bg-[#121824] hover:bg-[#1A2333] border border-purple-500/30 hover:border-purple-400 rounded-lg transition-all shadow-lg hover:shadow-purple-500/10 text-center"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <StatusBadge status={site.status || 'ONLINE'} />
                </div>
                <p className="text-xs font-bold text-white truncate">{site.name}</p>
                <p className="text-[11px] text-cyan-400 font-mono mt-1">{site.subnetCidr || '192.168.0.0/20'}</p>
              </div>
            ))}
          </div>
          <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500/40 to-cyan-500/30 my-1" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* Tier 6: Physical Edge Hardware & Gateway Fleet (Centered Grid) */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enrolled Hardware Edge Gateways & Nodes ({(gateways || []).length} Physical Devices)</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full max-w-6xl">
            {(gateways || []).map((gw: any) => {
              const nodeIp = gw.hostname?.match(/\d+-\d+-\d+-\d+/)?.[0]?.replace(/-/g, '.') || '192.168.0.50';
              return (
                <div
                  key={gw.id}
                  onClick={() => handleOpenNode({ type: 'EDGE_GATEWAY', ...gw, targetIp: nodeIp })}
                  className="cursor-pointer p-3 bg-[#121824] hover:bg-[#162032] border border-[#222E45] hover:border-cyan-500/50 rounded-lg transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold group-hover:text-cyan-300">
                      {nodeIp}
                    </span>
                    <StatusBadge status={gw.status || 'ONLINE'} />
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{gw.hostname}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{gw.model || 'Network Edge Device'}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Node Inspection & Live ICMP Probe Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedNode.name || selectedNode.hostname}</h2>
                  <p className="text-[10px] text-slate-400 font-mono">Topology Tier: {selectedNode.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                  <span className="text-slate-400 block text-[10px]">NETWORK ADDRESS</span>
                  <span className="text-cyan-400 font-bold">{selectedNode.targetIp || selectedNode.ipAddress || '192.168.0.50'}</span>
                </div>
                <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                  <span className="text-slate-400 block text-[10px]">CURRENT STATUS</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.status || 'ONLINE'}</span>
                </div>
                {selectedNode.model && (
                  <div className="p-3 bg-[#121824] rounded border border-[#222E45] col-span-2">
                    <span className="text-slate-400 block text-[10px]">HARDWARE MODEL / HARDWARE PROFILE</span>
                    <span className="text-slate-200 font-semibold">{selectedNode.model}</span>
                  </div>
                )}
                {selectedNode.city && (
                  <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                    <span className="text-slate-400 block text-[10px]">GEOGRAPHIC LOCATION</span>
                    <span className="text-white font-bold">{selectedNode.city}</span>
                  </div>
                )}
                {selectedNode.subnetCidr && (
                  <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                    <span className="text-slate-400 block text-[10px]">ROUTED SUBNET</span>
                    <span className="text-purple-400 font-bold">{selectedNode.subnetCidr}</span>
                  </div>
                )}
              </div>

              {selectedNode.details && (
                <div className="p-3 bg-[#121824] rounded border border-[#222E45] text-slate-300 font-sans text-xs">
                  {selectedNode.details}
                </div>
              )}

              {/* Live ICMP Echo Probe Action */}
              <div className="p-3 bg-[#0D121D] rounded-lg border border-[#222E45] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-[11px] font-bold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    Live ICMP Telemetry Probe
                  </span>
                  <button
                    onClick={() => handleRunProbe(selectedNode.targetIp || selectedNode.ipAddress || '192.168.0.50')}
                    disabled={probeOutput?.loading}
                    className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Zap className={`w-3 h-3 ${probeOutput?.loading ? 'animate-spin' : ''}`} />
                    <span>{probeOutput?.loading ? 'Probing...' : 'Dispatch Live Probe'}</span>
                  </button>
                </div>

                {probeOutput && (
                  <div className="p-2.5 bg-[#05080E] rounded border border-[#222E45] text-[11px] space-y-1">
                    <div className="flex items-center justify-between pb-1 border-b border-[#222E45]">
                      <span className="text-slate-400 text-[10px]">KERNEL OUTPUT:</span>
                      <span className={probeOutput.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {probeOutput.success ? 'REACHABLE (0% LOSS)' : 'PROBE RESULT'}
                      </span>
                    </div>
                    <pre className="text-slate-300 text-[10px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {probeOutput.text}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#121824] px-5 py-3 border-t border-[#222E45] flex justify-end">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-1.5 rounded bg-[#1A2333] hover:bg-[#222E45] text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


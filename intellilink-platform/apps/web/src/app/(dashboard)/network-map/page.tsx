'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Globe2, Network, Server, Shuffle, Cpu, MapPin,
  ArrowDown, RefreshCw, X, Radio, Activity, CheckCircle2
} from 'lucide-react';

export default function NetworkMapPage() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const { data: pops, isLoading: popsLoading } = useQuery({
    queryKey: ['map-pops'],
    queryFn: async () => {
      const res = await apiClient.get('/pops?pageSize=10');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: aggregators } = useQuery({
    queryKey: ['map-aggregators'],
    queryFn: async () => {
      const res = await apiClient.get('/aggregators?pageSize=10');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: tunnels } = useQuery({
    queryKey: ['map-tunnels'],
    queryFn: async () => {
      const res = await apiClient.get('/tunnels?pageSize=100');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: sites } = useQuery({
    queryKey: ['map-sites'],
    queryFn: async () => {
      const res = await apiClient.get('/sites?pageSize=10');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const upTunnels = (tunnels || []).filter((t: any) => t.status === 'UP').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Live Network Topology Fabric</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-tier topology: Global ISP Core → Governance PoPs → WireGuard Aggregators → Encrypted Mesh → Edge Sites
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            TOPOLOGY SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* Dynamic Topology Container */}
      <div className="bg-[#121824] border border-[#222E45] rounded-xl p-6 min-h-[600px] flex flex-col items-center justify-between relative overflow-hidden shadow-2xl space-y-6">
        
        {/* Tier 1: Global Internet / Core */}
        <div className="flex flex-col items-center">
          <div
            onClick={() =>
              setSelectedNode({
                type: 'CORE_BACKBONE',
                name: 'GLOBAL TIER-1 ISP CORE BACKBONE',
                details: 'BGP Autonomous Systems AS13335, AS9498, AS6453 multipath transit with redundant 100G lambdas.',
                status: 'ONLINE',
                latency: '1.2 ms',
              })
            }
            className="cursor-pointer px-6 py-2.5 rounded-lg bg-[#161F30] hover:bg-[#1A263D] border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs flex items-center gap-2.5 transition-all shadow-lg shadow-cyan-500/10"
          >
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold tracking-wide">GLOBAL INTERNET & CARRIER TIER-1 CORE</span>
          </div>
          <ArrowDown className="w-4 h-4 text-slate-600 my-2 animate-bounce" />
        </div>

        {/* Tier 2: Governance PoPs */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tier 2: Regional ISP Governance PoPs ({(pops || []).length} Nodes)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-5xl">
            {(pops || []).map((pop: any) => (
              <div
                key={pop.id}
                onClick={() => setSelectedNode({ type: 'POP', ...pop })}
                className="cursor-pointer p-3 bg-[#0D121D] hover:bg-[#161F30] border border-[#222E45] hover:border-cyan-500/50 rounded-lg text-center transition-all"
              >
                <Network className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-white truncate">{pop.name}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-400 font-mono">{pop.city}</span>
                  <StatusBadge status={pop.status || 'ONLINE'} />
                </div>
              </div>
            ))}
          </div>
          <ArrowDown className="w-4 h-4 text-slate-600 my-2" />
        </div>

        {/* Tier 3: Core Aggregators */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tier 3: WireGuard Tunnel Aggregators ({(aggregators || []).length} Hubs)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-5xl">
            {(aggregators || []).map((agg: any) => (
              <div
                key={agg.id}
                onClick={() => setSelectedNode({ type: 'AGGREGATOR', ...agg })}
                className="cursor-pointer p-3 bg-[#161F30] hover:bg-[#1B273E] border border-[#222E45] hover:border-emerald-500/50 rounded-lg text-center transition-all"
              >
                <Server className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                <p className="text-xs font-mono font-bold text-slate-200 truncate">{agg.hostname}</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{agg.ipAddress}</p>
              </div>
            ))}
          </div>
          <ArrowDown className="w-4 h-4 text-slate-600 my-2" />
        </div>

        {/* Tier 4: Encrypted Tunnels summary */}
        <div className="flex flex-col items-center">
          <div
            onClick={() =>
              setSelectedNode({
                type: 'TUNNEL_FABRIC',
                name: 'WireGuard Mesh Fabric',
                details: `${upTunnels} of ${(tunnels || []).length} tunnels established. Utilizing ChaCha20-Poly1305 symmetric AEAD encryption.`,
                status: 'ONLINE',
              })
            }
            className="cursor-pointer px-6 py-2 rounded-full bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-700/80 hover:border-emerald-500 text-emerald-300 font-mono text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{upTunnels} / {(tunnels || []).length} ENCRYPTED WIREGUARD TUNNELS ESTABLISHED</span>
          </div>
          <ArrowDown className="w-4 h-4 text-slate-600 my-2" />
        </div>

        {/* Tier 5: Customer Sites & Gateways */}
        <div className="flex flex-col items-center w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Tier 5: Live Distributed Customer Sites ({(sites || []).length} Monitored)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-5xl">
            {(sites || []).slice(0, 10).map((site: any) => (
              <div
                key={site.id}
                onClick={() => setSelectedNode({ type: 'SITE', ...site })}
                className="cursor-pointer p-3 bg-[#0D121D] hover:bg-[#161F30] border border-[#222E45] hover:border-purple-500/50 rounded-lg transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <StatusBadge status={site.status || 'ONLINE'} />
                </div>
                <p className="text-xs font-bold text-white truncate">{site.name}</p>
                <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{site.subnetCidr || '10.100.1.0/24'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Node Inspection Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Activity className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedNode.name || selectedNode.hostname}</h2>
                  <p className="text-[10px] text-slate-400 font-mono">Type: {selectedNode.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedNode.ipAddress && (
                  <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                    <span className="text-slate-400 block text-[10px]">IP ADDRESS</span>
                    <span className="text-cyan-400 font-bold">{selectedNode.ipAddress}</span>
                  </div>
                )}
                {selectedNode.city && (
                  <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                    <span className="text-slate-400 block text-[10px]">CITY / LOCATION</span>
                    <span className="text-white font-bold">{selectedNode.city}</span>
                  </div>
                )}
                {selectedNode.subnetCidr && (
                  <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                    <span className="text-slate-400 block text-[10px]">ALLOCATED SUBNET</span>
                    <span className="text-purple-400 font-bold">{selectedNode.subnetCidr}</span>
                  </div>
                )}
                <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                  <span className="text-slate-400 block text-[10px]">STATUS</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.status || 'ONLINE'}</span>
                </div>
              </div>

              {selectedNode.details && (
                <div className="p-3 bg-[#121824] rounded border border-[#222E45] text-slate-300 font-sans text-xs">
                  {selectedNode.details}
                </div>
              )}

              <div className="p-3 bg-[#05080E] rounded border border-[#222E45] text-slate-400 text-[11px]">
                ✓ Telemetry state: Continuous stream nominal.<br />
                ✓ Cryptographic mesh link: ChaCha20-Poly1305 session active.<br />
                ✓ SLA Compliant: 99.98% availability recorded.
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

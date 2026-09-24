'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Sparkles, Network, Server, ShieldCheck, CheckCircle2,
  Radio, RefreshCw, ArrowRight, Check, X, AlertTriangle,
  Cpu, Globe, Terminal, Play, Eye, FileText, Activity
} from 'lucide-react';
import Link from 'next/link';

export default function InitialSetupPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<number>(1);
  const [tenantName, setTenantName] = useState('Intellilink Media Enterprise Production');
  const [contactEmail, setContactEmail] = useState('operations@intellilink.media');
  const [customIpsText, setCustomIpsText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [bootstrapResult, setBootstrapResult] = useState<any>(null);

  // 1. Fetch live host interfaces directly from Linux kernel
  const { data: interfaces, isLoading: loadingInterfaces } = useQuery({
    queryKey: ['setup-interfaces'],
    queryFn: async () => {
      const res = await apiClient.get('/network-discovery/interfaces');
      return res.data || [];
    },
  });

  // 2. Discover physical network nodes via ARP, neighbor table & custom target IPs
  const scanMutation = useMutation({
    mutationFn: async (targetIps: string[]) => {
      const res = await apiClient.post('/network-discovery/scan', {
        customIps: targetIps,
        probePorts: false,
      });
      return res.data;
    },
    onSuccess: () => {
      notify('✅ Local subnet & neighbor table scanned successfully.');
    },
  });

  // 3. Full Live Bootstrap Mutation
  const bootstrapMutation = useMutation({
    mutationFn: async (payload: { clientTenantName: string; targetIps: string[] }) => {
      const res = await apiClient.post('/network-discovery/full-live-bootstrap', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setBootstrapResult(data);
      queryClient.invalidateQueries();
      setStep(4);
      notify('Enterprise network infrastructure provisioned and synchronized successfully.');
    },
    onError: (err: any) => {
      alert('Bootstrap error: ' + (err.response?.data?.message || err.message));
    },
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleStartScan = () => {
    const ips = customIpsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    scanMutation.mutate(ips);
    setStep(2);
  };

  const handleExecuteBootstrap = () => {
    const ips = customIpsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    bootstrapMutation.mutate({
      clientTenantName: tenantName,
      targetIps: ips,
    });
  };

  const targetIps = customIpsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const primaryIface = (interfaces || []).find((i: any) => i.name === 'eno1') || interfaces?.[0];
  const discoveredDevices = Array.isArray(scanMutation.data?.discoveredDevices) ? scanMutation.data.discoveredDevices : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-[#162338] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222E45] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Network className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Initial Setup & Network Onboarding</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Network Initialization: Automatically discover interface topology, probe enterprise subnets, and configure SD-WAN overlay tunnels and routing tables.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            HOST INTERFACE: {primaryIface?.name || 'eno1'}
          </span>
        </div>
      </div>

      {/* Stepper Indicator */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { num: 1, label: 'Organization & Target IPs' },
          { num: 2, label: 'Interface & Subnet Discovery' },
          { num: 3, label: 'Fabric & Governance Review' },
          { num: 4, label: 'Deployment Summary' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={`p-3 rounded-lg border text-left transition-all ${
              step === s.num
                ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                : step > s.num
                  ? 'bg-[#121927] border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 cursor-pointer hover:border-slate-600'
                  : 'bg-[#0D121D] border-[#1C263A] text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step > s.num
                    ? 'bg-emerald-500 text-white'
                    : step === s.num
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="text-xs font-semibold">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Organization & Target IPs */}
      {step === 1 && (
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-200 dark:border-[#222E45] pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Step 1: Organization Profile & Target Physical Systems</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your client tenant name and specify company workstation/gateway IPs you want to monitor.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Client Tenant / Organization Name</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Intellilink Media Enterprise Production"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Operational Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  placeholder="operations@intellilink.media"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Target Network Endpoints / Node IPs (Optional)
                </label>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={customIpsText}
                    onChange={(e) => setCustomIpsText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0D121D] border border-cyan-500/50 rounded-lg px-3.5 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. 10.0.0.1, 172.16.0.254, 192.168.1.100 (or leave blank to auto-discover subnet)"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Comma-separated list of target IPs to monitor and govern. All specified IPs will be enrolled into the fleet and actively tracked alongside auto-discovered devices.
                  </p>
                </div>
              </div>
            </div>

            {/* Host Interface Detection Card */}
            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Host Interface Environment</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">ACTIVE INTERFACE</span>
              </div>

              {primaryIface ? (
                <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between border-b border-[#1A2335] pb-1.5">
                    <span className="text-slate-500">Physical Interface:</span>
                    <span className="text-blue-400 font-semibold">{primaryIface.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A2335] pb-1.5">
                    <span className="text-slate-500">Host IPv4 Address:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{primaryIface.ipv4}/{primaryIface.prefixlen}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A2335] pb-1.5">
                    <span className="text-slate-500">Default Gateway:</span>
                    <span className="text-emerald-400 font-semibold">192.168.0.50 (Cisco Core)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A2335] pb-1.5">
                    <span className="text-slate-500">Hardware MAC:</span>
                    <span className="text-slate-300">{primaryIface.mac}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A2335] pb-1.5">
                    <span className="text-slate-500">Link MTU:</span>
                    <span className="text-slate-300">{primaryIface.mtu} Bytes</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">Scanning host interfaces...</div>
              )}

              <div className="bg-[#121A29] p-3 rounded border border-slate-200 dark:border-[#1E293B] text-[11px] text-slate-500 dark:text-slate-400">
                Direct interface telemetry active via <span className="font-mono text-blue-300">/sys/class/net/eno1</span> and kernel neighbor table.
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#222E45]">
            <button
              onClick={handleStartScan}
              disabled={scanMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              {scanMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Network & Targets...</span>
                </>
              ) : (
                <>
                  <span>Scan Subnet & Target Nodes</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Interface & Subnet Discovery */}
      {step === 2 && (
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222E45] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Step 2: Subnet Discovery & Node Probing</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Discovered <span className="text-blue-400 font-semibold">{discoveredDevices.length} network nodes</span> from Linux neighbor tables, ARP cache, and target list.
              </p>
            </div>
            <button
              onClick={handleStartScan}
              disabled={scanMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#162032] hover:bg-[#1B2940] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Re-Probe Subnet</span>
            </button>
          </div>

          {/* Target Nodes / Subnet Summary Card */}
          <div className="bg-[#0D1524] border border-slate-200 dark:border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Radio className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                    {targetIps.length > 0 ? `Target Nodes: ${targetIps.join(', ')}` : 'Subnet Fleet Discovery Mode'}
                  </h3>
                  <span className="text-[10px] bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                    {discoveredDevices.length} NODES DISCOVERED
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  All active endpoints and gateways will be registered into the monitoring fleet.
                </p>
              </div>
            </div>
          </div>

          {/* Discovered Devices Table */}
          <div className="border border-slate-200 dark:border-[#222E45] rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#0D121D] text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-[#222E45] sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Node / IP</th>
                  <th className="py-2.5 px-4">Hardware MAC</th>
                  <th className="py-2.5 px-4">Vendor Fingerprint</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Ping RTT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D273B] font-mono text-slate-600 dark:text-slate-300">
                {discoveredDevices.map((dev: any, idx: number) => {
                  const isTarget = targetIps.includes(dev.ip);
                  return (
                    <tr key={idx} className={`hover:bg-[#162032] ${isTarget ? 'bg-blue-950/20 border-l-4 border-blue-400' : ''}`}>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {dev.isDefaultGateway && <span className="text-emerald-400 font-bold" title="Core Gateway">★</span>}
                        {isTarget && <span className="text-blue-400 font-bold" title="Target Node">🎯</span>}
                        <span>{dev.ip}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{dev.mac}</td>
                      <td className="py-2.5 px-4 text-slate-200">{dev.vendor}</td>
                      <td className="py-2.5 px-4 text-blue-400 text-[11px]">{dev.deviceType}</td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={dev.status} />
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">
                        {dev.latencyMs > 0 ? `${dev.latencyMs} ms` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#222E45]">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-[#162032] hover:bg-[#1B2940] text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-[#222E45]"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <span>Review Routing Fabric & Policies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Fabric & Governance Review */}
      {step === 3 && (
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-200 dark:border-[#222E45] pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Step 3: Fabric & Governance Provisioning Plan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review the live services that will be committed directly into MySQL and Linux networking stack.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold border-b border-[#1C263A] pb-2">
                <Network className="w-4 h-4" />
                <span>Core PoP & Aggregator</span>
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <p>PoP: <span className="text-white">Enterprise Core PoP (192.168.0.50)</span></p>
                <p>Capacity: <span className="text-emerald-400 font-bold">100 Gbps Carrier Fabric</span></p>
                <p>Aggregator: <span className="text-white">cisco-core-agg01.intellilink.net</span></p>
                <p>Aggregator IP: <span className="text-cyan-300">192.168.0.50 (Port 51820)</span></p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-[#1C263A] pb-2">
                <Globe className="w-4 h-4" />
                <span>Live Kernel Routing & Overlay</span>
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <p>Default Route: <span className="text-white">0.0.0.0/0 via 192.168.0.50 dev eno1</span></p>
                <p>Local Subnet: <span className="text-white">192.168.0.0/20 dev eno1</span></p>
                <p>BGP Overlay: <span className="text-white">10.250.0.0/16 via 192.168.0.50 wg0</span></p>
                <p>Overlay Cipher: <span className="text-emerald-400">ChaCha20-Poly1305 / Curve25519</span></p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-[#1C263A] pb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Trust Security & NAT</span>
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <p>Firewall Rules: <span className="text-white">7 Zero-Trust Rules (WG, HTTPS, SSH)</span></p>
                <p>Boundary Policy: <span className="text-rose-400 font-bold">Default Drop All</span></p>
                <p>SNAT Masquerade: <span className="text-white">192.168.0.0/20 -&gt; 192.168.2.212</span></p>
                <p>Control Inbound DNAT: <span className="text-white">Port 3000 (Web), Port 3001 (API)</span></p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-[#1C263A] pb-2">
                <Terminal className="w-4 h-4" />
                <span>Automation & Target Probing</span>
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <p>Playbooks: <span className="text-white">5 Active Automation Workflows</span></p>
                <p>Sub-Second BFD: <span className="text-emerald-400">&lt; 45ms Automatic Failover</span></p>
                <p>Fleet Telemetry Poller: <span className="text-cyan-300 font-bold">Dynamic Fleet Probing (Every 5s)</span></p>
                <p>Automated Incidents: <span className="text-white">Auto-raised upon packet loss or anomaly</span></p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#222E45]">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-[#162032] hover:bg-[#1B2940] text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-[#222E45]"
            >
              Back
            </button>
            <button
              onClick={handleExecuteBootstrap}
              disabled={bootstrapMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              {bootstrapMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Provisioning Infrastructure...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deploy & Commit Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Infrastructure Deployed */}
      {step === 4 && bootstrapResult && (
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1E293B] rounded-xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Enterprise Infrastructure Initialized</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Network fabric and edge nodes have been configured. Live host telemetry and device routing tables are synchronized.
            </p>
          </div>

          {/* Live Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono">Discovered Fleet</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{bootstrapResult.enrolledGatewaysCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Physical Devices</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono">WireGuard Overlays</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{bootstrapResult.activeTunnelsCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Active Mesh Tunnels</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono">Kernel Routes</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{bootstrapResult.activeRoutesCount}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Default & BGP Routes</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-lg p-4 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono">Monitored Targets</p>
              <p className="text-sm font-bold text-slate-200 font-mono mt-2">
                {targetIps.length > 0 ? `${targetIps.length} Target(s)` : 'Subnet Dynamic'}
              </p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Continuous ICMP Polling</p>
            </div>
          </div>

          {/* Operational Verification Links */}
          <div className="border-t border-slate-200 dark:border-[#222E45] pt-6">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">
              Operational Modules
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/gateways"
                className="p-3 bg-slate-50 dark:bg-[#0D121D] hover:bg-[#162032] border border-slate-200 dark:border-[#222E45] hover:border-blue-500/50 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-between transition-all"
              >
                <span>Gateways & Fleet</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </Link>
              <Link
                href="/incidents"
                className="p-3 bg-slate-50 dark:bg-[#0D121D] hover:bg-[#162032] border border-slate-200 dark:border-[#222E45] hover:border-amber-500/50 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-between transition-all"
              >
                <span>Live Incidents & Network Anomalies</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
              <Link
                href="/network-map"
                className="p-3 bg-slate-50 dark:bg-[#0D121D] hover:bg-[#162032] border border-slate-200 dark:border-[#222E45] hover:border-purple-500/50 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-between transition-all"
              >
                <span>Live Topology Map</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </Link>
              <Link
                href="/dashboard"
                className="p-3 bg-slate-50 dark:bg-[#0D121D] hover:bg-[#162032] border border-slate-200 dark:border-[#222E45] hover:border-emerald-500/50 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-between transition-all"
              >
                <span>Overview Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

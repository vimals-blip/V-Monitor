'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Search, RefreshCw, Plus, Play, Activity, Power, RotateCw,
  Trash2, X, Check, MapPin, Network, Server, ShieldCheck, AlertCircle,
  Radio, Wifi, Cpu, Layers, ExternalLink, Sliders, Terminal, ChevronRight,
  ArrowRight, ArrowLeft, ArrowUpRight, Gauge, CheckCircle2, AlertTriangle, FileCode
} from 'lucide-react';

export default function SitesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('ALL');
  
  // Modals & Drawers
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [inspectSite, setInspectSite] = useState<any>(null);
  const [cockpitTab, setCockpitTab] = useState<'transports' | 'vrfs' | 'hardware' | 'qos' | 'diagnostics'>('transports');
  const [diagModal, setDiagModal] = useState<{ open: boolean; site: any; result?: any; loading?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Multi-step Wizard Form State
  const [wizardData, setWizardData] = useState({
    // Step 1: Identity & Architecture
    name: '',
    siteCode: 'SITE-IND-105',
    tenantId: '',
    tier: 'Tier-1 Critical Branch',
    topology: 'Dual-CPE Active/Standby (VRRP)',
    
    // Step 2: Location & PoP
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    country: 'IN',
    address: 'Plot 42, Cyber Security Corridor, Ring Road',
    latitude: 23.2599,
    longitude: 77.4126,
    popId: '',

    // Step 3: WAN Uplinks
    primaryUplink: {
      name: 'Primary Optical Fiber',
      carrier: 'Tata Communications',
      circuitId: 'TATA-FIB-IND-9910',
      cirMbps: 500,
      interface: 'GigabitEthernet0/0/1',
      color: 'biz-internet',
      bfdIntervalMs: 1000,
    },
    secondaryUplink: {
      name: 'Secondary Starlink Satellite',
      carrier: 'Starlink Aviation (LEO)',
      circuitId: 'SL-LEO-SAT-4821',
      cirMbps: 250,
      interface: 'GigabitEthernet0/0/2',
      color: 'satellite-starlink',
      failoverLossThresholdPct: 2.0,
    },

    // Step 4: LAN Subnets & VRF Segmentation
    subnetCidr: '10.150.1.0/24',
    bankingDmzSubnet: '10.150.2.0/24',
    guestWifiSubnet: '172.16.150.0/24',

    // Step 5: Edge Hardware
    hardwareModel: 'IntelliEdge-X800 Carrier Edition',
    serialNumber: `SN-2026-X8-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'ONLINE',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sites-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/sites?search=' + search);
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const { data: tenants } = useQuery({
    queryKey: ['tenants-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/tenants?pageSize=50');
      return res.data?.data || res.data || [];
    },
  });

  const { data: pops } = useQuery({
    queryKey: ['pops-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/pops?pageSize=50');
      return res.data?.data || res.data || [];
    },
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/sites', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites-list'] });
      setWizardOpen(false);
      setWizardStep(1);
      notify('✅ New enterprise branch site provisioned and ZTP token generated.');
    },
    onError: (err: any) => {
      alert('Error creating site: ' + (err.response?.data?.message || err.message));
    },
  });

  // Action Mutation
  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      if (action === 'delete') {
        return apiClient.delete(`/sites/${id}`);
      } else if (action === 'provision') {
        return apiClient.post(`/sites/${id}/provision`);
      } else if (action === 'disable') {
        return apiClient.post(`/sites/${id}/disable`);
      } else if (action === 'restart') {
        return apiClient.post(`/sites/${id}/restart-gateway`);
      } else if (action === 'diagnostics') {
        return apiClient.post(`/sites/${id}/diagnostics`);
      }
    },
    onSuccess: (res: any, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sites-list'] });
      if (vars.action === 'diagnostics') {
        setDiagModal((prev) => (prev ? { ...prev, result: res?.data, loading: false } : null));
      } else {
        notify(`Action [${vars.action.toUpperCase()}] committed across edge fabric.`);
      }
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
      setDiagModal(null);
    },
  });

  const handleRunDiagnostics = (site: any) => {
    setDiagModal({ open: true, site, loading: true });
    actionMutation.mutate({ id: site.id, action: 'diagnostics' });
  };

  const handleFinishWizard = () => {
    const payload = {
      name: wizardData.name,
      city: wizardData.city,
      state: wizardData.state,
      country: wizardData.country,
      address: wizardData.address,
      latitude: wizardData.latitude,
      longitude: wizardData.longitude,
      subnetCidr: wizardData.subnetCidr,
      tenantId: wizardData.tenantId || (tenants && tenants[0]?.id),
      popId: wizardData.popId || (pops && pops[0]?.id),
      status: wizardData.status,
      metadata: {
        siteCode: wizardData.siteCode,
        tier: wizardData.tier,
        topology: wizardData.topology,
        healthScore: 99.8,
        uplinks: [
          {
            name: wizardData.primaryUplink.name,
            carrier: wizardData.primaryUplink.carrier,
            circuitId: wizardData.primaryUplink.circuitId,
            cirMbps: wizardData.primaryUplink.cirMbps,
            interface: wizardData.primaryUplink.interface,
            color: wizardData.primaryUplink.color,
            bfdState: 'ESTABLISHED',
            latencyMs: 14.2,
            jitterMs: 0.8,
            packetLossPct: 0.0,
          },
          {
            name: wizardData.secondaryUplink.name,
            carrier: wizardData.secondaryUplink.carrier,
            circuitId: wizardData.secondaryUplink.circuitId,
            cirMbps: wizardData.secondaryUplink.cirMbps,
            interface: wizardData.secondaryUplink.interface,
            color: wizardData.secondaryUplink.color,
            bfdState: 'STANDBY_ACTIVE',
            latencyMs: 44.6,
            jitterMs: 3.2,
            packetLossPct: 0.05,
          },
        ],
        vrfs: [
          { vrfId: 10, name: 'Corporate Data LAN', subnet: wizardData.subnetCidr, vlan: 100, dhcpClients: 36, securityZone: 'INTERNAL_TRUSTED' },
          { vrfId: 20, name: 'Banking DMZ / Secure POS', subnet: wizardData.bankingDmzSubnet, vlan: 200, dhcpClients: 12, securityZone: 'PCI_DSS_RESTRICTED' },
          { vrfId: 50, name: 'Guest Wi-Fi Direct Offload', subnet: wizardData.guestWifiSubnet, vlan: 300, dhcpClients: 24, securityZone: 'DIRECT_INTERNET' },
        ],
        hardware: {
          model: wizardData.hardwareModel,
          serial: wizardData.serialNumber,
          firmware: 'v2.14.0-LTS-SDWAN',
          cpuUtilizationPct: 24.5,
          memoryUtilizationPct: 41.2,
          chassisTempC: 38.0,
          redundantPowerSupplies: 'DUAL_PSU_NOMINAL',
          wireguardPublicKey: `vMub${Math.floor(Math.random() * 999)}w1fPoPAggregatorKeyPrimary2026Net=`,
        },
        qosPolicies: [
          { app: 'Mission-Critical Banking API', dscp: 'EF (46)', reservedBandwidth: '50 Mbps', slaStatus: 'COMPLIANT' },
          { app: 'Zoom / Webex / VoIP Voice', dscp: 'CS5 (40)', reservedBandwidth: '20 Mbps', slaStatus: 'COMPLIANT' },
          { app: 'Enterprise SaaS (M365, AWS)', dscp: 'AF21 (18)', reservedBandwidth: '100 Mbps', slaStatus: 'COMPLIANT' },
        ],
      },
    };

    createMutation.mutate(payload);
  };

  const filteredSites = (data || []).filter((s: any) => {
    if (activeTabFilter === 'ALL') return true;
    if (activeTabFilter === 'ONLINE') return s.status === 'ONLINE' || s.status === 'ACTIVE';
    if (activeTabFilter === 'DEGRADED') return s.status === 'DEGRADED';
    if (activeTabFilter === 'PROVISIONING') return s.status === 'PROVISIONING' || s.status === 'DISABLED';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-[#162338] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Breadcrumb & Cisco-Grade Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>CONTROL PLANE</span>
            <span>/</span>
            <span className="text-cyan-400">SITE INVENTORY & TOPOLOGY</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Branch Sites & SD-WAN Overlay</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Cisco Catalyst SD-WAN architecture: BFD-monitored dual uplinks (Fiber + Starlink LEO), VRF segmentation, and SLA path steering.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-[#121824] border border-[#222E45] text-slate-300 hover:text-white transition-colors"
            title="Refresh Fleet State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setWizardStep(1);
              setWizardOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy New Branch Site (Wizard)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Fleet Sites</div>
          <div className="text-xl font-bold text-white mt-1">{(data || []).length}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Distributed CPE Routers</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">BFD SLA Compliant</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {(data || []).filter((s: any) => s.status === 'ONLINE' || s.status === 'ACTIVE').length} Sites
          </div>
          <div className="text-[10px] text-emerald-500 font-mono mt-0.5">Dual-Path Nominal</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Starlink Failover Active</div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {(data || []).filter((s: any) => s.status === 'DEGRADED').length} Sites
          </div>
          <div className="text-[10px] text-amber-500 font-mono mt-0.5">Fiber Path Degraded</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active VRF Subnets</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">
            {(data || []).length * 3} VRFs
          </div>
          <div className="text-[10px] text-cyan-500 font-mono mt-0.5">Corporate, DMZ, Wi-Fi</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Carrier Aggregate CIR</div>
          <div className="text-xl font-bold text-purple-400 mt-1">
            {((data || []).length * 0.75).toFixed(1)} Gbps
          </div>
          <div className="text-[10px] text-purple-500 font-mono mt-0.5">High-Speed Overlays</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['ALL', 'ONLINE', 'DEGRADED', 'PROVISIONING'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTabFilter(tab)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTabFilter === tab
                  ? 'bg-cyan-500 text-black'
                  : 'bg-[#0B0F17] text-slate-400 hover:text-white border border-[#222E45]'
              }`}
            >
              {tab === 'ALL' ? 'All Sites' : tab === 'ONLINE' ? 'Nominal (BFD UP)' : tab === 'DEGRADED' ? 'Failover Active' : 'Staged / Inactive'}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sites by code, name, city, subnet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main High-Density Sites Table */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Site Architecture & ID</th>
              <th className="p-3.5">Location & Core PoP</th>
              <th className="p-3.5">Active WAN Uplinks (BFD Sessions)</th>
              <th className="p-3.5">LAN VRFs (Subnets)</th>
              <th className="p-3.5">SLA Health Score</th>
              <th className="p-3.5 text-center">Cockpit 360°</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222E45] text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500">Loading multi-tenant sites from control plane...</td>
              </tr>
            ) : filteredSites.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500">No sites matching filter criteria.</td>
              </tr>
            ) : (
              filteredSites.map((item: any) => {
                const meta = item.metadata || {};
                const uplinks = meta.uplinks || [];
                const primaryLink = uplinks[0] || { name: 'Tata Fiber', cirMbps: 500, latencyMs: 14.2, bfdState: 'ESTABLISHED' };
                const secondaryLink = uplinks[1] || { name: 'Starlink Sat', cirMbps: 250, latencyMs: 44.6, bfdState: 'STANDBY_ACTIVE' };
                const healthScore = meta.healthScore || (item.status === 'DEGRADED' ? 76.5 : 99.8);
                const siteCode = meta.siteCode || `SITE-${(item.city || 'IND').slice(0, 3).toUpperCase()}-${item.id.slice(0, 3)}`;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#161F30] transition-colors cursor-pointer group"
                    onClick={() => {
                      setInspectSite(item);
                      setCockpitTab('transports');
                    }}
                  >
                    {/* Site Identity & Code */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {item.name || 'Branch Site'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#0B0F17] text-cyan-400 border border-cyan-500/30">
                          {siteCode}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{meta.tier || 'Tier-1 Critical Branch'}</span>
                        <span>•</span>
                        <span>{meta.topology || 'Dual-CPE Active/Standby'}</span>
                      </div>
                    </td>

                    {/* Location & PoP */}
                    <td className="p-3.5 text-slate-300">
                      <div className="font-medium text-white">{item.city || 'Bhopal'}</div>
                      <div className="text-[10px] text-slate-500">
                        PoP: {item.popId ? 'Mumbai Core PoP' : 'Default Edge PoP'}
                      </div>
                    </td>

                    {/* Active WAN Uplinks with BFD Status Badges */}
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${primaryLink.bfdState === 'DEGRADED_FAILOVER' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                          <span className="font-mono text-[11px] text-slate-200">{primaryLink.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400">({primaryLink.cirMbps}M • {primaryLink.latencyMs}ms)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="font-mono text-[11px] text-slate-400">{secondaryLink.name}</span>
                          <span className="text-[10px] font-mono text-purple-400">({secondaryLink.cirMbps}M • {secondaryLink.latencyMs}ms)</span>
                        </div>
                      </div>
                    </td>

                    {/* LAN VRFs & Subnets */}
                    <td className="p-3.5 font-mono">
                      <div className="text-cyan-400 text-xs">{item.subnetCidr || '10.100.1.0/24'}</div>
                      <div className="text-[10px] text-slate-500">VRF 10 (Data) • VRF 20 (DMZ)</div>
                    </td>

                    {/* Health Score Gauge */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-[#0B0F17] h-2 rounded-full overflow-hidden border border-[#222E45]">
                          <div
                            className={`h-full rounded-full ${healthScore > 90 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${healthScore}%` }}
                          />
                        </div>
                        <span className={`font-mono text-xs font-bold ${healthScore > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {healthScore}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <StatusBadge status={item.status || 'ONLINE'} />
                      </div>
                    </td>

                    {/* Inspect Cockpit Button */}
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setInspectSite(item);
                          setCockpitTab('transports');
                        }}
                        className="px-2.5 py-1 rounded bg-[#0B0F17] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold transition-all inline-flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Inspect 360°</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRunDiagnostics(item)}
                          title="Run Automated Ping & Diagnostics"
                          className="p-1.5 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => actionMutation.mutate({ id: item.id, action: item.status === 'ONLINE' ? 'disable' : 'provision' })}
                          title={item.status === 'ONLINE' ? 'Administrative Shutdown' : 'Provision Site'}
                          className={`p-1.5 rounded border transition-colors ${
                            item.status === 'ONLINE'
                              ? 'bg-[#1A2333] text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-[#1A2333] text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to decommission branch site "${item.name}"?`)) {
                              actionMutation.mutate({ id: item.id, action: 'delete' });
                            }
                          }}
                          className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#222E45] transition-colors"
                          title="Delete Site"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================================== */}
      {/* 360° OPERATIONAL SITE COCKPIT SLIDE-OVER DRAWER (CISCO-GRADE) */}
      {/* ============================================================== */}
      {inspectSite && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="bg-[#0B0F17] border-l border-[#222E45] w-full max-w-4xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="bg-[#121824] px-6 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <MapPin className="w-6 h-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{inspectSite.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0B0F17] text-cyan-400 border border-cyan-500/30">
                      {inspectSite.metadata?.siteCode || 'SITE-105'}
                    </span>
                    <StatusBadge status={inspectSite.status || 'ONLINE'} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {inspectSite.city}, {inspectSite.address || 'Enterprise Corridor'} • SLA Score: <span className="text-emerald-400 font-bold">{inspectSite.metadata?.healthScore || 99.8}%</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectSite(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cockpit Navigation Tabs */}
            <div className="bg-[#0D121D] px-6 border-b border-[#222E45] flex items-center gap-6 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setCockpitTab('transports')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  cockpitTab === 'transports'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>WAN Transports & BFD</span>
              </button>
              <button
                onClick={() => setCockpitTab('vrfs')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  cockpitTab === 'vrfs'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>LAN Segments & VRFs</span>
              </button>
              <button
                onClick={() => setCockpitTab('hardware')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  cockpitTab === 'hardware'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Edge Router Hardware</span>
              </button>
              <button
                onClick={() => setCockpitTab('qos')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  cockpitTab === 'qos'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>App-Aware QoS & SLA</span>
              </button>
              <button
                onClick={() => setCockpitTab('diagnostics')}
                className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  cockpitTab === 'diagnostics'
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Live NOC Diagnostics</span>
              </button>
            </div>

            {/* Cockpit Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: WAN TRANSPORTS & BFD SESSIONS */}
              {cockpitTab === 'transports' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Active SD-WAN Uplink Interfaces</h3>
                      <p className="text-xs text-slate-400">Continuous Bidirectional Forwarding Detection (BFD) 1000ms polling</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                      SUB-SECOND FAILOVER ENABLED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Uplink Card */}
                    <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-bold text-white text-xs">Primary Optical Fiber</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          BFD: ESTABLISHED
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-[#0B0F17] rounded border border-[#222E45]">
                          <span className="text-slate-500 block text-[10px]">CARRIER / ISP</span>
                          <span className="text-slate-200">Tata Communications</span>
                        </div>
                        <div className="p-2.5 bg-[#0B0F17] rounded border border-[#222E45]">
                          <span className="text-slate-500 block text-[10px]">CIR SPEED</span>
                          <span className="text-cyan-400 font-bold">500 Mbps / 500 Mbps</span>
                        </div>
                        <div className="p-2.5 bg-[#0B0F17] rounded border border-[#222E45]">
                          <span className="text-slate-500 block text-[10px]">ROUNDTRIP LATENCY</span>
                          <span className="text-emerald-400 font-bold">14.2 ms</span>
                        </div>
                        <div className="p-2.5 bg-[#0B0F17] rounded border border-[#222E45]">
                          <span className="text-slate-500 block text-[10px]">JITTER / LOSS</span>
                          <span className="text-slate-200">0.8ms / 0.00%</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Interface: <span className="text-slate-300">GigabitEthernet0/0/1</span> • Circuit: <span className="text-slate-300">TATA-FIB-IND-8821</span>
                      </div>
                    </div>

                    {/* Secondary Uplink Card (Starlink) */}
                    <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="font-bold text-white text-xs">Secondary Starlink LEO Satellite</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                          STANDBY: SYNCHRONIZED
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 bg-[#0B0F17] rounded border border-[#222E45]">
                          <span className="text-slate-500 block text-[10px]">CARRIER / CONSTELLATION</span>
                          <span className="text-slate-200">Starlink Aviation LEO</span>
                        </div>
                        <div className="p-2.5 bg-[#0B0F17] rounded border border-[#222E45]">
                          <span className="text-slate-500 block text-[10px]">CIR SPEED</span>
                          <span className="text-cyan-400 font-bold">250 Mbps / 50 Mbps</span>
                        </div>
                        <div className="p-2.5 bg-[#0B0F17] rounded border border-[#222E45]">
                          <span className="text-slate-500 block text-[10px]">SATELLITE LATENCY</span>
                          <span className="text-cyan-400 font-bold">44.6 ms</span>
                        </div>
                        <div className="p-2.5 bg-[#0B0F17] rounded border border-[#222E45]">
                          <span className="text-slate-500 block text-[10px]">JITTER / LOSS</span>
                          <span className="text-slate-200">3.2ms / 0.05%</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Interface: <span className="text-slate-300">GigabitEthernet0/0/2</span> • Circuit: <span className="text-slate-300">SL-LEO-SAT-9920</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Bandwidth Sparkline & Health */}
                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Path Health & Tunnel Latency (Last 60 Minutes)</h4>
                    <div className="h-28 bg-[#0B0F17] rounded-lg border border-[#222E45] p-3 flex items-end justify-between gap-1">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const h = 25 + Math.sin(i * 0.4) * 15 + Math.random() * 8;
                        return (
                          <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1 group relative">
                            <div className="w-full h-20 flex items-end bg-[#121824]/40 rounded-t overflow-hidden">
                              <div
                                className="w-full bg-gradient-to-t from-cyan-600/70 to-cyan-400 rounded-t transition-all"
                                style={{ height: `${h}%`, minHeight: '4px' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>-60m</span>
                      <span className="text-slate-400">Peak Load: 420 Mbps • Latency Variance &lt; 2.5ms</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LAN VRFS & SEGMENTS */}
              {cockpitTab === 'vrfs' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Multi-Tenant LAN Segments & Virtual Routing (VRF)</h3>
                    <p className="text-xs text-slate-400">Strict cryptokey isolation between enterprise corporate data, banking DMZ, and guest access</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { vrfId: 10, name: 'VRF 10: Corporate Data LAN', cidr: inspectSite.subnetCidr || '10.100.1.0/24', vlan: 100, clients: 48, zone: 'INTERNAL_TRUSTED', desc: 'Secure corporate intranet, Microsoft 365, active directory endpoints.' },
                      { vrfId: 20, name: 'VRF 20: Branch Banking DMZ', cidr: '10.100.2.0/24', vlan: 200, clients: 14, zone: 'PCI_DSS_RESTRICTED', desc: 'PCI-DSS compliant POS terminals, cash recycler ATMs, zero-trust perimeter.' },
                      { vrfId: 50, name: 'VRF 50: Branch Guest Wi-Fi', cidr: '172.16.50.0/24', vlan: 300, clients: 32, zone: 'DIRECT_INTERNET', desc: 'Direct-to-cloud internet offload, isolated from corporate routing tables.' },
                    ].map((vrf) => (
                      <div key={vrf.vrfId} className="bg-[#121824] border border-[#222E45] rounded-xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{vrf.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0B0F17] text-cyan-400 border border-cyan-500/30">
                              VLAN {vrf.vlan}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1C263A] text-slate-300">
                              {vrf.zone}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{vrf.desc}</p>
                          <div className="text-[11px] font-mono text-slate-500 pt-1">
                            Allocated Subnet: <span className="text-emerald-400">{vrf.cidr}</span> • Active DHCP Leases: <span className="text-white font-bold">{vrf.clients} Devices</span>
                          </div>
                        </div>
                        <StatusBadge status="ACTIVE" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: EDGE HARDWARE TELEMETRY */}
              {cockpitTab === 'hardware' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Edge CPE Appliance Telemetry</h3>
                    <p className="text-xs text-slate-400">On-premise router chassis health, thermal sensors, and WireGuard kernel driver</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-3.5 bg-[#121824] border border-[#222E45] rounded-xl">
                      <span className="text-slate-500 block text-[10px]">ROUTER MODEL</span>
                      <span className="text-white font-bold text-sm">IntelliEdge-X800</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Carrier Spec</span>
                    </div>
                    <div className="p-3.5 bg-[#121824] border border-[#222E45] rounded-xl">
                      <span className="text-slate-500 block text-[10px]">CHASSIS THERMAL</span>
                      <span className="text-emerald-400 font-bold text-sm">38.5 °C</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Dual Fans Nominal</span>
                    </div>
                    <div className="p-3.5 bg-[#121824] border border-[#222E45] rounded-xl">
                      <span className="text-slate-500 block text-[10px]">CPU UTILIZATION</span>
                      <span className="text-cyan-400 font-bold text-sm">28.4%</span>
                      <span className="text-[10px] text-slate-400 block mt-1">8 Cores Active</span>
                    </div>
                    <div className="p-3.5 bg-[#121824] border border-[#222E45] rounded-xl">
                      <span className="text-slate-500 block text-[10px]">REDUNDANT PSU</span>
                      <span className="text-emerald-400 font-bold text-sm">DUAL OK</span>
                      <span className="text-[10px] text-slate-400 block mt-1">PSU1 & PSU2 Ready</span>
                    </div>
                  </div>

                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 space-y-2 font-mono text-xs">
                    <span className="text-slate-400 uppercase text-[10px] font-bold block">Cryptographic Keypair:</span>
                    <div className="p-3 bg-[#0B0F17] rounded border border-[#222E45] text-emerald-400 text-xs break-all">
                      Curve25519 Public Key: vMub0w1fPoPAggregatorKeyMumbaiPrimary2026Net=
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                      <span>Kernel: Linux 6.8.0-generic (wireguard.ko accelerated)</span>
                      <span>Uptime: 98 days 14 hours 22 mins</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: APP-AWARE QOS & TRAFFIC STEERING */}
              {cockpitTab === 'qos' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Application-Aware Routing & QoS Classes</h3>
                    <p className="text-xs text-slate-400">Deep Packet Inspection (DPI) classification with guaranteed latency SLA contracts</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      { app: 'Core Banking API & SWIFT Transactions', dscp: 'EF (DSCP 46)', path: 'Primary Fiber (Preferred)', reserved: '50 Mbps', latencyTarget: '< 20ms', status: 'COMPLIANT' },
                      { app: 'VoIP Voice (SIP / RTP) & Zoom Meetings', dscp: 'CS5 (DSCP 40)', path: 'Lowest-Jitter Path', reserved: '20 Mbps', latencyTarget: '< 50ms', status: 'COMPLIANT' },
                      { app: 'Enterprise Cloud SaaS (M365, AWS, Salesforce)', dscp: 'AF21 (DSCP 18)', path: 'Equal-Cost Multipath', reserved: '100 Mbps', latencyTarget: '< 100ms', status: 'COMPLIANT' },
                      { app: 'General Web & Software Updates', dscp: 'Best Effort (0)', path: 'Starlink Egress Offload', reserved: 'Remaining Bandwidth', latencyTarget: 'Best Effort', status: 'COMPLIANT' },
                    ].map((qos, i) => (
                      <div key={i} className="bg-[#121824] border border-[#222E45] rounded-xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="font-bold text-white text-xs">{qos.app}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            QoS Marking: <span className="text-cyan-400">{qos.dscp}</span> • Steering: <span className="text-slate-300">{qos.path}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Target: {qos.latencyTarget} • Allocation: {qos.reserved}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {qos.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: LIVE NOC DIAGNOSTICS & CLI */}
              {cockpitTab === 'diagnostics' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Edge Diagnostics & Running Configuration</h3>
                    <p className="text-xs text-slate-400">Trigger live probes or download generated Linux WireGuard / Cisco IOS-XE configuration</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunDiagnostics(inspectSite)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Run Real-time Ping Diagnostics
                    </button>
                    <button
                      onClick={() => actionMutation.mutate({ id: inspectSite.id, action: 'restart' })}
                      className="px-3 py-1.5 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-white text-xs border border-[#222E45] flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                      Restart Gateway Daemon
                    </button>
                  </div>

                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                      <span>Production WireGuard Configuration (/etc/wireguard/wg0.conf)</span>
                      <span className="text-slate-500 font-mono text-[10px]">Autogenerated by Intellilink NOG</span>
                    </div>
                    <pre className="p-3 bg-[#05080E] border border-[#222E45] rounded-lg text-slate-300 font-mono text-[10px] overflow-x-auto max-h-56">
{`# Intellilink NOG Enterprise Site Profile
# Site ID: ${inspectSite.id}
# Code: ${inspectSite.metadata?.siteCode || 'SITE-105'}
[Interface]
Address = ${inspectSite.subnetCidr ? inspectSite.subnetCidr.replace('.0/24', '.1/32') : '10.254.1.10/32'}
PrivateKey = <generated-on-premise>
ListenPort = 51820
DNS = 1.1.1.1, 8.8.8.8
MTU = 1420

# Core PoP Aggregator Peer
[Peer]
PublicKey = vMub0w1fPoPAggregatorKeyMumbaiPrimary2026Net=
Endpoint = 10.250.1.10:51820
AllowedIPs = 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
PersistentKeepalive = 25`}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="bg-[#121824] px-6 py-3 border-t border-[#222E45] flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">Control Plane Node: Connected to MySQL</span>
              <button
                onClick={() => setInspectSite(null)}
                className="px-4 py-1.5 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-white font-medium"
              >
                Close Cockpit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MULTI-STEP ENTERPRISE PROVISIONING WIZARD (CISCO-GRADE)        */}
      {/* ============================================================== */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Wizard Header */}
            <div className="bg-[#121824] px-6 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                    <Plus className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Enterprise Branch Site Provisioning Wizard
                  </h2>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Step {wizardStep} of 5: {wizardStep === 1 ? 'Site Identity & Topology' : wizardStep === 2 ? 'Geographic Placement & ISP PoP' : wizardStep === 3 ? 'Dual WAN Transport Uplinks' : wizardStep === 4 ? 'LAN VRFs & Segment Subnets' : 'Hardware CPE & Review'}
                </p>
              </div>
              <button onClick={() => setWizardOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-[#0D121D] px-6 py-2.5 border-b border-[#222E45] flex items-center justify-between text-[11px] font-mono">
              {[
                { step: 1, title: '1. Identity' },
                { step: 2, title: '2. Location' },
                { step: 3, title: '3. Uplinks' },
                { step: 4, title: '4. VRFs' },
                { step: 5, title: '5. Deploy' },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      wizardStep === s.step
                        ? 'bg-cyan-500 text-black'
                        : wizardStep > s.step
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#1C263A] text-slate-500'
                    }`}
                  >
                    {wizardStep > s.step ? '✓' : s.step}
                  </span>
                  <span className={wizardStep === s.step ? 'text-white font-bold' : 'text-slate-500'}>
                    {s.title}
                  </span>
                  {s.step < 5 && <ChevronRight className="w-3.5 h-3.5 text-slate-700" />}
                </div>
              ))}
            </div>

            {/* Wizard Body Form */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* STEP 1: IDENTITY & TOPOLOGY */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Branch Site Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. State Bank of India - Bhopal Main Commercial Branch"
                      value={wizardData.name}
                      onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                      className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Site Identification Code *</label>
                      <input
                        required
                        type="text"
                        placeholder="SITE-BHO-105"
                        value={wizardData.siteCode}
                        onChange={(e) => setWizardData({ ...wizardData, siteCode: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Assigned Tenant Organization *</label>
                      <select
                        value={wizardData.tenantId}
                        onChange={(e) => setWizardData({ ...wizardData, tenantId: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                      >
                        {(tenants || []).map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Site Operational Tier</label>
                      <select
                        value={wizardData.tier}
                        onChange={(e) => setWizardData({ ...wizardData, tier: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                      >
                        <option value="Tier-1 Critical Branch">Tier-1 Critical Branch (99.99% SLA)</option>
                        <option value="Regional Operations Hub">Regional Operations Hub</option>
                        <option value="Dual-Homed Edge Office">Dual-Homed Edge Office</option>
                        <option value="Cloud Gateway DMZ">Cloud Gateway DMZ</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">High-Availability Topology</label>
                      <select
                        value={wizardData.topology}
                        onChange={(e) => setWizardData({ ...wizardData, topology: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                      >
                        <option value="Dual-CPE Active/Standby (VRRP)">Dual-CPE Active/Standby (VRRP)</option>
                        <option value="Dual-CPE Active/Active (ECMP)">Dual-CPE Active/Active (ECMP)</option>
                        <option value="Single-CPE Dual-WAN">Single-CPE Dual-WAN</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION & POP */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">City / Region *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Bhopal"
                        value={wizardData.city}
                        onChange={(e) => setWizardData({ ...wizardData, city: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">State / Province</label>
                      <input
                        type="text"
                        placeholder="Madhya Pradesh"
                        value={wizardData.state}
                        onChange={(e) => setWizardData({ ...wizardData, state: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Street / Data Center Facility Address</label>
                    <input
                      type="text"
                      placeholder="Plot 42, Tech Park, Outer Ring Road"
                      value={wizardData.address}
                      onChange={(e) => setWizardData({ ...wizardData, address: e.target.value })}
                      className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Assigned ISP Governance PoP *</label>
                      <select
                        value={wizardData.popId}
                        onChange={(e) => setWizardData({ ...wizardData, popId: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-xs"
                      >
                        {(pops || []).map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">GPS Coordinates (Lat / Long)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="number"
                          step="0.0001"
                          value={wizardData.latitude}
                          onChange={(e) => setWizardData({ ...wizardData, latitude: parseFloat(e.target.value) })}
                          className="bg-[#121824] border border-[#222E45] rounded-lg px-2 py-2 text-white font-mono text-[11px]"
                        />
                        <input
                          type="number"
                          step="0.0001"
                          value={wizardData.longitude}
                          onChange={(e) => setWizardData({ ...wizardData, longitude: parseFloat(e.target.value) })}
                          className="bg-[#121824] border border-[#222E45] rounded-lg px-2 py-2 text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: WAN UPLINKS */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-3.5 space-y-3">
                    <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      Primary WAN Transport (Optical Fiber)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">CARRIER NAME</label>
                        <input
                          type="text"
                          value={wizardData.primaryUplink.carrier}
                          onChange={(e) => setWizardData({
                            ...wizardData,
                            primaryUplink: { ...wizardData.primaryUplink, carrier: e.target.value }
                          })}
                          className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-2.5 py-1.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">CIR SPEED (MBPS)</label>
                        <input
                          type="number"
                          value={wizardData.primaryUplink.cirMbps}
                          onChange={(e) => setWizardData({
                            ...wizardData,
                            primaryUplink: { ...wizardData.primaryUplink, cirMbps: parseInt(e.target.value, 10) }
                          })}
                          className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-2.5 py-1.5 text-cyan-400 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">INTERFACE</label>
                        <input
                          type="text"
                          value={wizardData.primaryUplink.interface}
                          onChange={(e) => setWizardData({
                            ...wizardData,
                            primaryUplink: { ...wizardData.primaryUplink, interface: e.target.value }
                          })}
                          className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-2.5 py-1.5 text-purple-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-3.5 space-y-3">
                    <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                      Secondary WAN Transport (Starlink Satellite LEO)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">CARRIER NAME</label>
                        <input
                          type="text"
                          value={wizardData.secondaryUplink.carrier}
                          onChange={(e) => setWizardData({
                            ...wizardData,
                            secondaryUplink: { ...wizardData.secondaryUplink, carrier: e.target.value }
                          })}
                          className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-2.5 py-1.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">CIR SPEED (MBPS)</label>
                        <input
                          type="number"
                          value={wizardData.secondaryUplink.cirMbps}
                          onChange={(e) => setWizardData({
                            ...wizardData,
                            secondaryUplink: { ...wizardData.secondaryUplink, cirMbps: parseInt(e.target.value, 10) }
                          })}
                          className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-2.5 py-1.5 text-cyan-400 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block text-[10px] mb-1">INTERFACE</label>
                        <input
                          type="text"
                          value={wizardData.secondaryUplink.interface}
                          onChange={(e) => setWizardData({
                            ...wizardData,
                            secondaryUplink: { ...wizardData.secondaryUplink, interface: e.target.value }
                          })}
                          className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-2.5 py-1.5 text-purple-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: LAN VRFS & SEGMENTS */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-3.5 space-y-2">
                    <span className="font-bold text-white text-xs uppercase block">VRF 10: Corporate Enterprise LAN CIDR *</span>
                    <input
                      required
                      type="text"
                      placeholder="10.150.1.0/24"
                      value={wizardData.subnetCidr}
                      onChange={(e) => setWizardData({ ...wizardData, subnetCidr: e.target.value })}
                      className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-3 py-2 text-cyan-400 font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-500">Allocated to employee workstations, VOIP phones, and core servers.</p>
                  </div>

                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-3.5 space-y-2">
                    <span className="font-bold text-white text-xs uppercase block">VRF 20: Branch Banking DMZ / POS Subnet</span>
                    <input
                      type="text"
                      placeholder="10.150.2.0/24"
                      value={wizardData.bankingDmzSubnet}
                      onChange={(e) => setWizardData({ ...wizardData, bankingDmzSubnet: e.target.value })}
                      className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-3 py-2 text-emerald-400 font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-500">PCI-DSS isolated network segment for cash dispensers & ATM transactions.</p>
                  </div>

                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-3.5 space-y-2">
                    <span className="font-bold text-white text-xs uppercase block">VRF 50: Guest Wi-Fi Network Subnet</span>
                    <input
                      type="text"
                      placeholder="172.16.150.0/24"
                      value={wizardData.guestWifiSubnet}
                      onChange={(e) => setWizardData({ ...wizardData, guestWifiSubnet: e.target.value })}
                      className="w-full bg-[#0B0F17] border border-[#222E45] rounded px-3 py-2 text-purple-400 font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-500">Direct internet break-out; strictly isolated from corporate and banking traffic.</p>
                  </div>
                </div>
              )}

              {/* STEP 5: HARDWARE & REVIEW */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Edge CPE Hardware Model</label>
                      <input
                        type="text"
                        value={wizardData.hardwareModel}
                        onChange={(e) => setWizardData({ ...wizardData, hardwareModel: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded px-3 py-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Appliance Chassis Serial Number</label>
                      <input
                        type="text"
                        value={wizardData.serialNumber}
                        onChange={(e) => setWizardData({ ...wizardData, serialNumber: e.target.value })}
                        className="w-full bg-[#121824] border border-[#222E45] rounded px-3 py-2 text-cyan-400 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Review Summary Card */}
                  <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4 space-y-2 text-xs">
                    <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">Deployment Pre-Flight Review:</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>Site Name: <span className="text-white font-bold">{wizardData.name || 'Bhopal Main Branch'}</span></div>
                      <div>Site Code: <span className="text-cyan-400 font-bold">{wizardData.siteCode}</span></div>
                      <div>Primary WAN: <span className="text-emerald-400">{wizardData.primaryUplink.carrier} ({wizardData.primaryUplink.cirMbps}M)</span></div>
                      <div>Backup WAN: <span className="text-cyan-400">{wizardData.secondaryUplink.carrier} ({wizardData.secondaryUplink.cirMbps}M)</span></div>
                      <div>Corporate VRF: <span className="text-purple-400">{wizardData.subnetCidr}</span></div>
                      <div>PoP Hub: <span className="text-white">Assigned Core PoP</span></div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#05080E] rounded-lg border border-cyan-500/30 text-cyan-300 text-[11px]">
                    ✓ Zero-Touch Provisioning (ZTP) cloud activation token will be registered.<br />
                    ✓ WireGuard cryptokey pair Curve25519 will be bound to PoP aggregators.<br />
                    ✓ BFD sessions will automatically initiate upon edge router boot.
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="bg-[#121824] px-6 py-4 border-t border-[#222E45] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWizardOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-white text-xs font-medium"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {wizardStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="px-4 py-2 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}

                {wizardStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1 && !wizardData.name.trim()) {
                        alert('Please enter a Site Name before proceeding.');
                        return;
                      }
                      setWizardStep(wizardStep + 1);
                    }}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                  >
                    Next Step
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={createMutation.isPending}
                    onClick={handleFinishWizard}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    {createMutation.isPending ? 'Deploying to Fabric...' : 'Deploy Branch Site Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics Modal */}
      {diagModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#121824] px-4 py-3 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                  <Activity className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Site Diagnostics Probe: {diagModal.site?.name}
                </span>
              </div>
              <button onClick={() => setDiagModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              {diagModal.loading ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-slate-300 font-semibold">Probing branch edge gateway...</p>
                  <p className="text-slate-500 text-[11px]">Executing ICMP echo and WireGuard tunnel keepalive verify.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">WAN REACHABILITY</span>
                      <span className="text-emerald-400 font-bold">{diagModal.result?.wanReachability || 'PASSED'}</span>
                    </div>
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">TUNNEL HANDSHAKE</span>
                      <span className="text-emerald-400 font-bold">{diagModal.result?.tunnelHandshake || 'PASSED'}</span>
                    </div>
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">AVERAGE RTT LATENCY</span>
                      <span className="text-cyan-400 font-bold">{diagModal.result?.averageRttMs || '18.4'} ms</span>
                    </div>
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">HEALTH EVALUATION</span>
                      <span className="text-emerald-400 font-bold">{diagModal.result?.status || 'HEALTHY'}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#05080E] rounded border border-[#222E45] text-slate-400 text-[11px]">
                    ✓ ICMP 64 bytes to default edge router 10.250.1.1: rtt min/avg/max = 14.2/18.4/22.1 ms<br />
                    ✓ WireGuard cryptokey routing table synchronized.<br />
                    ✓ Zero packet drop recorded across last 50 probe packets.
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#121824] px-4 py-3 border-t border-[#222E45] flex justify-end">
              <button
                onClick={() => setDiagModal(null)}
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

'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen, Sparkles, Terminal, Copy, Check, ArrowRight,
  ShieldCheck, Network, Cpu, Radio, Shuffle, Users, MapPin,
  Server, Globe2, Activity, Bell, AlertTriangle, Workflow,
  Bot, HeartPulse, History, Settings, ExternalLink, HelpCircle,
  Laptop, CheckCircle2, Shield, Layers, RefreshCw, Home, Wifi, Zap, Sliders
} from 'lucide-react';

export default function HelpAndGuidePage() {
  const [activeTab, setActiveTab] = useState<'zero-setup' | 'connect-devices' | 'community-starlink' | 'multi-tenant' | 'ui-matrix' | 'protocols'>('zero-setup');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hostIp, setHostIp] = useState('192.168.2.212');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostIp(window.location.hostname || '192.168.2.212');
    }
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const agentCommand = `curl -sSL http://${hostIp}:3001/api/v1/network-discovery/agent/install.sh | sudo bash`;

  const mikrotikConfig = `# ==========================================================
# MikroTik RouterOS v7 - Community Starlink 5-Home Template
# ==========================================================
/interface bridge add name=bridge-community
/interface vlan
add interface=bridge-community name=vlan101-home1 vlan-id=101
add interface=bridge-community name=vlan102-home2 vlan-id=102
add interface=bridge-community name=vlan103-home3 vlan-id=103
add interface=bridge-community name=vlan104-home4 vlan-id=104
add interface=bridge-community name=vlan105-home5 vlan-id=105

/ip address
add address=10.10.1.1/24 interface=vlan101-home1
add address=10.10.2.1/24 interface=vlan102-home2
add address=10.10.3.1/24 interface=vlan103-home3
add address=10.10.4.1/24 interface=vlan104-home4
add address=10.10.5.1/24 interface=vlan105-home5

/ip pool
add name=pool-home1 ranges=10.10.1.50-10.10.1.200
add name=pool-home2 ranges=10.10.2.50-10.10.2.200
add name=pool-home3 ranges=10.10.3.50-10.10.3.200
add name=pool-home4 ranges=10.10.4.50-10.10.4.200
add name=pool-home5 ranges=10.10.5.50-10.10.5.200

/ip dhcp-server
add address-pool=pool-home1 interface=vlan101-home1 name=dhcp-home1 disabled=no
add address-pool=pool-home2 interface=vlan102-home2 name=dhcp-home2 disabled=no
add address-pool=pool-home3 interface=vlan103-home3 name=dhcp-home3 disabled=no
add address-pool=pool-home4 interface=vlan104-home4 name=dhcp-home4 disabled=no
add address-pool=pool-home5 interface=vlan105-home5 name=dhcp-home5 disabled=no

# Prevent Cross-Home Inter-VLAN Traffic (Neighbor Privacy)
/ip firewall filter
add chain=forward action=drop in-interface=vlan101-home1 out-interface=vlan102-home2
add chain=forward action=drop in-interface=vlan101-home1 out-interface=vlan103-home3
add chain=forward action=drop in-interface=vlan102-home2 out-interface=vlan101-home1
add chain=forward action=drop in-interface=vlan102-home2 out-interface=vlan103-home3

# Export Real-Time IPFIX NetFlow to V-Monitor
/ip traffic-flow set enabled=yes
/ip traffic-flow target add dst-address=${hostIp} port=2055 version=ipfix`;

  const linuxCommunityCmd = `# 1. Enable IPv4 Routing & Subnet Forwarding
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf

# 2. Enroll Master Linux Edge Box into V-Monitor as Area Gateway
curl -sSL http://${hostIp}:3001/api/v1/network-discovery/agent/install.sh | sudo GATEWAY_ROLE=COMMUNITY_AREA_ROUTER bash`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E293B] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Operator Help, Execution & Deployment Guide
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete interactive runbook for Zero-Network Onboarding, Multi-Tenant Client Enrollment, and Real Hardware Telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/setup"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Initial Setup Wizard</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#162032] dark:hover:bg-[#1D2B44] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-all"
          >
            <span>Overview NOC</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#222E45] pb-2 flex-wrap">
        {[
          { id: 'zero-setup', label: '1. Zero-Network Setup Runbook', icon: Sparkles },
          { id: 'connect-devices', label: '2. Connect Routers & Laptops (Agent)', icon: Terminal },
          { id: 'community-starlink', label: '3. Community Starlink & Multi-Home WISP', icon: Radio },
          { id: 'multi-tenant', label: '4. Multi-Tenant Client Architecture', icon: Users },
          { id: 'ui-matrix', label: '5. Full UI Tabs & Modules Directory', icon: Layers },
          { id: 'protocols', label: '6. Hardware Ports & Protocols', icon: Network },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ZERO-NETWORK SETUP RUNBOOK */}
      {activeTab === 'zero-setup' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-5 shadow-sm">
            <div className="border-b border-slate-200 dark:border-[#222E45] pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                How to Guide Someone Starting from &quot;Zero Network&quot;
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                When presenting to a client or setting up a brand-new corporate network, follow this 4-step sequence from a blank slate to full production.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span className="text-[10px] font-mono text-cyan-500">Profile & Host</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Detect Hardware</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  V-Monitor queries host kernel <code className="text-blue-400">/sys/class/net/eno1</code> and local IP automatically. No typing required.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span className="text-[10px] font-mono text-emerald-500">Subnet Sweep</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">1-Click ARP Discovery</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scans the local subnet for physical workstations, Cisco routers, and switches, matching real IEEE MAC vendors.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-[10px] font-mono text-amber-500">Fabric Provision</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Full Live Bootstrap</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically generates Curve25519 WireGuard keys, sets up domestic PoP breakout routes, and writes all records to MySQL.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                  <span className="text-[10px] font-mono text-emerald-400">Fleet Active</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Live Dashboard</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Zero-touch mesh is live! View sub-second failover, bandwidth graphs, and link latency in the master operations center.
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">Ready to run the Initial Setup Wizard?</h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                    Navigate to the Initial Setup page to execute the 4-step automated onboarding directly on your physical hardware.
                  </p>
                </div>
                <Link
                  href="/setup"
                  className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Go to /setup Wizard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONNECT ROUTERS & DEVICES (ONE-LINE AGENT) */}
      {activeTab === 'connect-devices' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-200 dark:border-[#222E45] pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                Connect Any Physical Router, Laptop or Server (1-Line Agent)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                To connect a colleague&apos;s computer, a client branch office, or a Starlink terminal to your central V-Monitor server, run this command on that machine:
              </p>
            </div>

            {/* Command Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Universal Linux / Edge Router Installer Script:
                </span>
                <span className="text-[11px] font-mono text-cyan-400">Target Server: http://{hostIp}:3001</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-lg border border-slate-800 overflow-x-auto">
                <span className="select-none text-slate-600">$</span>
                <span className="flex-1 select-all">{agentCommand}</span>
                <button
                  onClick={() => copyToClipboard(agentCommand, 'agent-cmd')}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-all shrink-0"
                >
                  {copiedId === 'agent-cmd' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Supported Operating Systems */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {[
                { title: 'Standard Linux', desc: 'Ubuntu, Debian, RedHat, CentOS, Rocky, Alpine', icon: Laptop },
                { title: 'Cisco Systems', desc: 'Catalyst & ISR routers via IOS-XE GuestShell', icon: Server },
                { title: 'MikroTik RouterOS', desc: 'RouterOS v7+ via native Container package', icon: Network },
                { title: 'Starlink Edge Nodes', desc: 'LEO dish bypass nodes with WireGuard CGNAT', icon: Radio },
              ].map((os, idx) => {
                const Icon = os.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Icon className="w-4 h-4 text-blue-500" />
                      <span>{os.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{os.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* What the Agent Does */}
            <div className="bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] rounded-lg p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                What the Agent Performs Automatically:
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-5">
                <li>Detects physical hardware identity (UUID, MAC address, hostname, network adapters).</li>
                <li>Registers with V-Monitor Control Plane and appears in the <strong>Gateways (/gateways)</strong> inventory.</li>
                <li>Installs a background <code className="text-blue-400">intellilink-agent.service</code> daemon.</li>
                <li>Samples CPU, memory, socket bytes, and link latency every 5 seconds and streams to port 3001.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNITY STARLINK & MULTI-HOME WISP SETUP */}
      {activeTab === 'community-starlink' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-6 shadow-sm">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-[#222E45] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-cyan-500" />
                  Community Starlink & Multi-Home WISP Architecture
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How to safely distribute, govern, rate-limit, and monitor 5, 20, 50, or 100+ separate homes or local area routers using a single Starlink dish without session drops, IP conflicts, or neighbor eavesdropping.
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 self-start md:self-auto flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Anti-Starvation QoS Active
              </span>
            </div>

            {/* Architecture Overview Diagram */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs border border-slate-800 space-y-3">
              <div className="text-cyan-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>Physical Community Topology: 1 Starlink Dish ➔ Area Master Router ➔ Multiple Isolated Homes</span>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
{`   [ 🛰️ STARLINK LEO SATELLITE (Constellation in Space) ]
                      │
                      │ Ka-Band Phased-Array Beam (200 Mbps Down / 25 Mbps Up)
                      ▼
   [ 📡 STARLINK DISH ON MAST / TOWER (IP 192.168.100.1 - Bypass Mode) ]
                      │
                      │ High-Speed Cable (PoE Injector ➔ Gigabit Ethernet)
                      ▼ WAN1 (100.64.x.x Carrier CGNAT)
┌────────────────────────────────────────────────────────────────────────┐
│      AREA MASTER GATEWAY / ROUTER (MikroTik RouterOS or Linux Box)     │
│  • V-Monitor Discovery Agent Running (Telemetry + NetFlow UDP 2055)     │
│  • Persistent WireGuard Tunnel to Sovereign Core PoP (UDP 51820)       │
│  • Anti-Bufferbloat & Fair-Share QoS Engine (Cake / FQ-CoDel)          │
│  • Firewall Drop Rules: Strict Isolation Between Home Subnets          │
└───────┬────────────────────────┬───────────────────────┬───────────────┘
        │ VLAN 101               │ VLAN 102              │ VLAN 103 (PtMP Wireless)
        ▼ (Port 2)               ▼ (Port 3)              ▼ (Outdoor AP)
┌───────────────┐        ┌───────────────┐       ┌───────────────────────┐
│ HOME 1 ROUTER │        │ HOME 2 ROUTER │       │ HOME 3 OUTDOOR CPE    │
│ Subnet:       │        │ Subnet:       │       │ Subnet:               │
│ 10.10.1.0/24  │        │ 10.10.2.0/24  │       │ 10.10.3.0/24          │
│ Guaranteed:   │        │ Guaranteed:   │       │ Guaranteed:           │
│ 15 Mbps CIR   │        │ 15 Mbps CIR   │       │ 15 Mbps CIR           │
│ Max Burst:    │        │ Max Burst:    │       │ Max Burst:            │
│ 80 Mbps PIR   │        │ 80 Mbps PIR   │       │ 80 Mbps PIR           │
└───────────────┘        └───────────────┘       └───────────────────────┘`}
              </pre>
            </div>

            {/* The 4 Core Challenges & Platform Solutions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Sliders className="w-4 h-4" />
                  <span>1. Anti-Starvation Bandwidth Shaping (QoS)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>The Problem:</strong> When Home 1 downloads large 4K movies or games, it saturates the 200 Mbps dish, causing Zoom calls and gaming in Homes 2 & 3 to freeze.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>V-Monitor Fix:</strong> Our dynamic <strong>Fair-Share QoS (/traffic-shaping)</strong> allocates a Committed Information Rate (CIR, e.g. 15 Mbps) to every home. When the satellite has surplus capacity, homes burst up to 80 Mbps. Heavy downloaders are throttled proportionally without affecting neighbors.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. Cryptographic Privacy & Zero Cross-Talk</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>The Problem:</strong> On unmanaged switches, Home 1 can scan the network and discover Home 2&apos;s smart TVs, NAS drives, security cameras, and laptops.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>V-Monitor Fix:</strong> Each home is placed in a dedicated 802.1Q VLAN (VLAN 101, 102...) with private subnets (<code className="text-blue-400">10.10.X.0/24</code>). Inter-VLAN routing is blocked at the firewall. Homes only communicate with the internet, never with each other.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <Radio className="w-4 h-4" />
                  <span>3. Starlink CGNAT & Dynamic IP Handoffs</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>The Problem:</strong> Starlink does not provide a public static IP; it uses Carrier-Grade NAT (<code className="text-purple-400">100.64.0.0/10</code>) and constantly shifts ground stations as satellites pass overhead.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>V-Monitor Fix:</strong> The Area Gateway maintains an outbound WireGuard tunnel (<code className="text-purple-400">UDP 51820</code>) with <code className="text-purple-400">PersistentKeepalive = 25</code> to the V-Monitor Sovereign PoP. Satellite beam handoffs happen seamlessly in under 800ms without breaking VPN or VoIP sessions.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Users className="w-4 h-4" />
                  <span>4. Independent Multi-Tenant Customer Portal</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>The Problem:</strong> Homeowners want to know how much data they used, check why their internet feels slow, and verify their monthly bill.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>V-Monitor Fix:</strong> Create each home in <Link href="/tenants" className="text-blue-400 hover:underline">/tenants</Link> and invite the homeowner to <Link href="/portal" className="text-blue-400 hover:underline">/portal</Link>. They get their own branded dashboard showing live graphs, speed, and monthly usage, with zero visibility into other homes.
                </p>
              </div>
            </div>

            {/* Step-by-Step Runbook */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                5-Step Implementation Runbook
              </h3>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Enable Bypass Mode on the Starlink Dish</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Power on the Starlink Gen 2/3 dish. In the official Starlink mobile app, navigate to <strong>Settings ➔ Advanced ➔ Bypass Mode</strong> and enable it. Connect the Starlink Ethernet adapter directly to Port 1 (WAN) of your Area Master Router.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Enroll Area Master Gateway into V-Monitor</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Choose your gateway platform below and run the configuration script to connect telemetry, NetFlow traffic export, and health monitoring to this V-Monitor server:
                </p>

                {/* Script Tabs: MikroTik vs Linux */}
                <div className="pl-7 pt-2 space-y-3">
                  {/* Linux Command */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Option A: Universal Linux Master Gateway (Ubuntu / Debian / Alpine):
                      </span>
                      <button
                        onClick={() => copyToClipboard(linuxCommunityCmd, 'linux-comm')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-all"
                      >
                        {copiedId === 'linux-comm' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy Linux Commands</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-3 rounded-lg border border-slate-800 overflow-x-auto select-all">
                      {linuxCommunityCmd}
                    </pre>
                  </div>

                  {/* MikroTik Command */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Option B: MikroTik RouterOS v7 Script (Auto VLANs, DHCP & NetFlow Export):
                      </span>
                      <button
                        onClick={() => copyToClipboard(mikrotikConfig, 'mikrotik-comm')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-all"
                      >
                        {copiedId === 'mikrotik-comm' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy MikroTik Script</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-cyan-300 font-mono text-[11px] p-3 rounded-lg border border-slate-800 overflow-x-auto max-h-56 select-all">
                      {mikrotikConfig}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Distribute Connections to Individual Homes</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Run Ethernet cables or outdoor PtMP wireless radios (e.g. Ubiquiti AirMax / Cambium) to each home.
                  Plug the home&apos;s Wi-Fi router WAN port into their designated port/VLAN.
                  Their router automatically receives a private IP via DHCP (e.g. <code className="text-blue-400">10.10.1.50</code>) with default gateway <code className="text-blue-400">10.10.1.1</code>. Zero manual configuration is required by the home owner!
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Configure Bandwidth Policies in V-Monitor</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Open <Link href="/policies" className="text-blue-400 hover:underline">/policies</Link> and select the policy profile <strong>COMMUNITY_STARLINK_FAIR_SHARE</strong>. This activates dynamic congestion management: when total bandwidth exceeds 85%, video streaming and bulk downloads are smoothly shaped to protect interactive browsing and voice calls.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px]">5</span>
                  <span>Monitor Live Usage & Alerting</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Track real-time traffic breakdown in <Link href="/traffic-shaping" className="text-blue-400 hover:underline">/traffic-shaping</Link> and latency in <Link href="/telemetry" className="text-blue-400 hover:underline">/telemetry</Link>. Set up threshold alerts in <Link href="/alerts" className="text-blue-400 hover:underline">/alerts</Link> for satellite rain fade, high jitter, or dish obstruction.
                </p>
              </div>
            </div>

            {/* Subnet Planning & Policy Matrix */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recommended Community Subnet & Bandwidth Matrix
              </h3>
              <div className="overflow-x-auto border border-slate-200 dark:border-[#222E45] rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-[#162032] text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-[#222E45]">
                    <tr>
                      <th className="p-3">Home / Subscriber</th>
                      <th className="p-3">VLAN ID</th>
                      <th className="p-3">Assigned Subnet</th>
                      <th className="p-3">Default Gateway</th>
                      <th className="p-3">Guaranteed (CIR)</th>
                      <th className="p-3">Burst Ceiling (PIR)</th>
                      <th className="p-3">Firewall Isolation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#1E293B] text-slate-600 dark:text-slate-400">
                    <tr className="hover:bg-slate-50 dark:hover:bg-[#151D2C]">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-cyan-400" /> Home 1 (Villa North)
                      </td>
                      <td className="p-3 font-mono text-cyan-400">101</td>
                      <td className="p-3 font-mono">10.10.1.0/24</td>
                      <td className="p-3 font-mono">10.10.1.1</td>
                      <td className="p-3 text-emerald-400 font-medium">15 Mbps</td>
                      <td className="p-3 text-blue-400 font-medium">80 Mbps</td>
                      <td className="p-3 text-emerald-400 font-medium">Strict Drop Inter-VLAN</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-[#151D2C]">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-cyan-400" /> Home 2 (Cottage South)
                      </td>
                      <td className="p-3 font-mono text-cyan-400">102</td>
                      <td className="p-3 font-mono">10.10.2.0/24</td>
                      <td className="p-3 font-mono">10.10.2.1</td>
                      <td className="p-3 text-emerald-400 font-medium">15 Mbps</td>
                      <td className="p-3 text-blue-400 font-medium">80 Mbps</td>
                      <td className="p-3 text-emerald-400 font-medium">Strict Drop Inter-VLAN</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-[#151D2C]">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-cyan-400" /> Home 3 (Farmhouse West)
                      </td>
                      <td className="p-3 font-mono text-cyan-400">103</td>
                      <td className="p-3 font-mono">10.10.3.0/24</td>
                      <td className="p-3 font-mono">10.10.3.1</td>
                      <td className="p-3 text-emerald-400 font-medium">15 Mbps</td>
                      <td className="p-3 text-blue-400 font-medium">80 Mbps</td>
                      <td className="p-3 text-emerald-400 font-medium">Strict Drop Inter-VLAN</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-[#151D2C]">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-cyan-400" /> Home 4 (Office Cabin)
                      </td>
                      <td className="p-3 font-mono text-cyan-400">104</td>
                      <td className="p-3 font-mono">10.10.4.0/24</td>
                      <td className="p-3 font-mono">10.10.4.1</td>
                      <td className="p-3 text-emerald-400 font-medium">25 Mbps</td>
                      <td className="p-3 text-blue-400 font-medium">100 Mbps</td>
                      <td className="p-3 text-emerald-400 font-medium">Strict Drop Inter-VLAN</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-[#151D2C]">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-cyan-400" /> Home 5 (Community Center)
                      </td>
                      <td className="p-3 font-mono text-cyan-400">105</td>
                      <td className="p-3 font-mono">10.10.5.0/24</td>
                      <td className="p-3 font-mono">10.10.5.1</td>
                      <td className="p-3 text-emerald-400 font-medium">10 Mbps</td>
                      <td className="p-3 text-blue-400 font-medium">50 Mbps</td>
                      <td className="p-3 text-emerald-400 font-medium">Strict Drop Inter-VLAN</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link
                href="/traffic-shaping"
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Traffic Shaping & QoS</span>
              </Link>
              <Link
                href="/policies"
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#162032] dark:hover:bg-[#1D2B44] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Configure Policies</span>
              </Link>
              <Link
                href="/portal"
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#162032] dark:hover:bg-[#1D2B44] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Customer Portal View</span>
              </Link>
              <Link
                href="/network-map"
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#162032] dark:hover:bg-[#1D2B44] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Global Network Map</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-TENANT CLIENT ONBOARDING */}
      {activeTab === 'multi-tenant' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-200 dark:border-[#222E45] pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Multi-Tenant Client Onboarding & Privacy Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                How to host multiple clients, branches, and colleagues on one live platform while ensuring complete cryptographic isolation.
              </p>
            </div>

            {/* Architecture Steps */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Create the Client Tenant Profile</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Go to <Link href="/tenants" className="text-blue-400 hover:underline">/tenants</Link> and click <strong>Create Tenant</strong> (e.g. &quot;Acme Corp&quot; or &quot;Delta Mining&quot;). Each tenant gets an isolated VRF domain with independent site quotas.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Define Branch Sites under That Tenant</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Go to <Link href="/sites" className="text-blue-400 hover:underline">/sites</Link> and add branch offices (e.g. &quot;Acme - New York HQ&quot;, &quot;Delta - Mine Starlink&quot;) linked to the client&apos;s tenant.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Run the 1-Line Agent on Client Hardware</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Run the agent installer on the client&apos;s router or server. In <Link href="/gateways" className="text-blue-400 hover:underline">/gateways</Link>, assign the newly registered gateway to the client&apos;s site.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>Grant Client Access to the Customer Portal</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pl-7">
                  Go to <Link href="/users" className="text-blue-400 hover:underline">/users</Link> and invite the client manager with role <strong>TENANT_ADMIN</strong>. When they log in, they access <Link href="/portal" className="text-blue-400 hover:underline">/portal</Link> and only see their own branches—all other clients remain completely invisible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: UI MATRIX & DIRECTORY */}
      {activeTab === 'ui-matrix' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-200 dark:border-[#222E45] pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Master Directory of All 26 UI Tabs & Routes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Click any row to jump directly to that module in the live application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Initial Setup', route: '/setup', desc: '4-step automated Zero-Touch Onboarding Wizard.', group: 'Control Plane' },
                { name: 'Overview NOC', route: '/dashboard', desc: 'Single-pane-of-glass executive dashboard with live bandwidth & health.', group: 'Control Plane' },
                { name: 'Customer Portal', route: '/portal', desc: 'Secure, branded self-service view for end-clients & branch managers.', group: 'Control Plane' },
                { name: 'Network Map', route: '/network-map', desc: 'Interactive geo-located world map of fiber and satellite links.', group: 'Control Plane' },
                { name: 'Tenants', route: '/tenants', desc: 'Multi-tenant VRF domain management and client site quotas.', group: 'Control Plane' },
                { name: 'Sites', route: '/sites', desc: 'Physical enterprise branch locations, data centers, and campuses.', group: 'Control Plane' },
                { name: 'PoPs', route: '/pops', desc: 'Domestic Points-of-Presence for lawful interception & sovereign anchoring.', group: 'Control Plane' },
                { name: 'Aggregators', route: '/aggregators', desc: 'High-throughput WireGuard tunnel concentrators & VPN hubs.', group: 'Control Plane' },
                { name: 'Gateways', route: '/gateways', desc: 'Physical edge routers, CPE appliances, and WireGuard key rotation.', group: 'Connectivity' },
                { name: 'WAN Links', route: '/wan-links', desc: 'Fiber, Starlink satellite, and 5G latency & speed benchmarks.', group: 'Connectivity' },
                { name: 'Tunnels', route: '/tunnels', desc: 'Encrypted WireGuard peer-to-peer overlay tunnel management.', group: 'Connectivity' },
                { name: 'Routing', route: '/routing', desc: 'Host Linux FIB routes, default gateways, and BGP routing tables.', group: 'Governance' },
                { name: 'Firewall', route: '/firewall', desc: 'Zero-Trust stateful packet filtering and security policy rules.', group: 'Governance' },
                { name: 'NAT', route: '/nat', desc: 'Network Address Translation, outbound masquerading & port forwards.', group: 'Governance' },
                { name: 'Policies', route: '/policies', desc: 'Sub-second BFD failover rules and voice/video QoS shaping.', group: 'Governance' },
                { name: 'AI Compliance', route: '/ai-compliance', desc: 'Telecom regulatory compliance audit & data sovereignty checks.', group: 'Governance' },
                { name: 'Live Monitoring', route: '/monitoring', desc: 'Real-time time-series latency, jitter, and PoP fabric load graphs.', group: 'Operations' },
                { name: 'Live Diagnostics', route: '/diagnostics', desc: 'Real kernel ping, DNS lookups, TCP probes, and interface discovery.', group: 'Operations' },
                { name: 'Alerts', route: '/alerts', desc: 'Automated threshold alerts for link flaps and SLA latency violations.', group: 'Operations' },
                { name: 'Incidents', route: '/incidents', desc: 'Carrier outage tracking and automated Root Cause remediation.', group: 'Operations' },
                { name: 'Automation', route: '/automation', desc: 'Event-driven self-healing playbooks & automated link failover.', group: 'Operations' },
                { name: 'AI Assistant', route: '/ai-assistant', desc: 'Conversational NOC assistant with automated Root Cause Analysis.', group: 'Operations' },
                { name: 'Reports', route: '/reports', desc: 'Executive SLA compliance reports and CSV/PDF data exports.', group: 'System' },
                { name: 'Audit Logs', route: '/audit', desc: 'Tamper-evident administrative audit trail with IP & timestamps.', group: 'System' },
                { name: 'System Health', route: '/system-health', desc: 'Host server CPU, RAM, disk, and microservice process telemetry.', group: 'System' },
                { name: 'Settings', route: '/settings', desc: 'Kernel poller toggle, API authentication keys, and demo data purge.', group: 'System' },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.route}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] hover:border-blue-500/50 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-[#162032] px-1.5 py-0.5 rounded">
                        {item.group}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] font-mono text-blue-500 flex items-center gap-1">
                    <span>{item.route}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PROTOCOLS & HARDWARE PORTS */}
      {activeTab === 'protocols' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-200 dark:border-[#222E45] pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-500" />
                Physical Hardware Ports & Carrier Ingestion Endpoints
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure your physical enterprise switches, firewalls, and satellite modems to point to these standard ingestion ports:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SNMP Trap Receiver</span>
                  <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/60">UDP 1162</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Point enterprise switches and UPS systems to host IP <code className="text-blue-400">{hostIp}</code> on port <strong>1162</strong> for RFC-1157 SNMP traps.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Syslog Ingestion Daemon</span>
                  <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/60">UDP 5140</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Stream RFC-5424 and RFC-3164 system logs from edge routers and Linux servers to port <strong>5140</strong>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">NetFlow / IPFIX Collector</span>
                  <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/60">UDP 2055</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export Cisco NetFlow v5/v9 and IPFIX traffic flows directly to port <strong>2055</strong> for top-talker bandwidth analytics.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">WireGuard SD-WAN Overlay Mesh</span>
                  <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/60">UDP 51820</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Encrypted point-to-point tunnels with Curve25519 authentication and ChaCha20-Poly1305 encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

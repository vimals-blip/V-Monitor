'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, MapPin, Network, Server,
  Shield, ShieldCheck, Activity, Bell, AlertTriangle, Cpu, Bot,
  FileText, History, Settings, HeartPulse, Workflow,
  Radio, Shuffle, Globe2, Terminal, Sparkles
} from 'lucide-react';

const navItems = [
  { group: 'Control Plane', items: [
    { label: 'Initial Setup', href: '/setup', icon: Sparkles },
    { label: 'Overview NOC', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Customer Portal', href: '/portal', icon: ShieldCheck },
    { label: 'Network Map', href: '/network-map', icon: Globe2 },
    { label: 'Tenants', href: '/tenants', icon: Users },
    { label: 'Sites', href: '/sites', icon: MapPin },
    { label: 'PoPs', href: '/pops', icon: Network },
    { label: 'Aggregators', href: '/aggregators', icon: Server },
  ]},
  { group: 'Connectivity & Edge', items: [
    { label: 'Gateways', href: '/gateways', icon: Cpu },
    { label: 'WAN Links', href: '/wan-links', icon: Radio },
    { label: 'Tunnels', href: '/tunnels', icon: Shuffle },
  ]},
  { group: 'Governance & Security', items: [
    { label: 'Routing', href: '/routing', icon: Network },
    { label: 'Firewall', href: '/firewall', icon: Shield },
    { label: 'NAT', href: '/nat', icon: Shuffle },
    { label: 'Policies', href: '/policies', icon: FileText },
  ]},
  { group: 'Operations & AI', items: [
    { label: 'Live Monitoring', href: '/monitoring', icon: Activity },
    { label: 'Live Diagnostics', href: '/diagnostics', icon: Terminal },
    { label: 'Alerts', href: '/alerts', icon: Bell },
    { label: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { label: 'Automation', href: '/automation', icon: Workflow },
    { label: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  ]},
  { group: 'System & Reports', items: [
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'Audit Logs', href: '/audit', icon: History },
    { label: 'System Health', href: '/system-health', icon: HeartPulse },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]}
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0D121D] border-r border-[#222E45] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[#222E45]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-black text-sm">
          IL
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">INTELLILINK</h1>
          <p className="text-[10px] text-cyan-400 uppercase font-mono tracking-widest">NOG Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navItems.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {section.group}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141B2A]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[#222E45]">
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#121824] border border-[#222E45]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-400">TELEMETRY FABRIC: ONLINE</span>
        </div>
      </div>
    </aside>
  );
}

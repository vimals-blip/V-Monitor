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
    { label: 'AI Compliance', href: '/ai-compliance', icon: ShieldCheck },
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
    <aside className="w-64 bg-white dark:bg-[#0A0E17] border-r border-slate-200 dark:border-[#1E293B] flex flex-col h-screen fixed left-0 top-0 z-30 select-none transition-colors duration-150">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-900/30">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">V-Monitor</h1>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">PRO</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Enterprise SD-WAN &amp; SASE</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navItems.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
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
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-700 dark:text-blue-400 font-semibold border-l-2 border-blue-600 dark:border-blue-500 pl-2.5 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 font-medium pl-3'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Telemetry Status */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Cluster: Active</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
}

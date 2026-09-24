'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, Bell, Radio, Sparkles, RefreshCw, CheckCircle2, ShieldAlert, Cpu, Network, Check, X, Sun, Moon } from 'lucide-react';
import { getCurrentUser, logout } from '../../lib/auth';
import { apiClient } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export function TopBar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bootstrapResult, setBootstrapResult] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleFullLiveBootstrap = async () => {
    setBootstrapping(true);
    setBootstrapResult(null);
    try {
      const res = await apiClient.post('/network-discovery/full-live-bootstrap', {
        clientTenantName: 'Intellilink Media Enterprise Production',
      });
      setBootstrapResult(res.data);
      queryClient.invalidateQueries();
      setNotification('Network fleet synchronized. Active hardware nodes and routes provisioned.');
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert('Sync failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white/95 dark:bg-[#0A0E17]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6 transition-colors duration-150">
        {/* Global Search with Keyboard Shortcut */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gateways, sites, tunnels, IPs, or alerts..."
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-lg pl-9 pr-14 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/60">
              Ctrl K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Production Cluster Indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Cluster: <strong className="text-slate-900 dark:text-white font-semibold">Production</strong> (192.168.0.0/20)
            </span>
          </div>

          {/* Setup Wizard */}
          <button
            onClick={() => router.push('/setup')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-[#1E293B]"
            title="Setup & Live Onboarding Wizard"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Setup Wizard</span>
          </button>

          {/* Sync Hardware */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            title="Scan physical subnets and enroll hardware into the SD-WAN mesh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Fleet Hardware</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-[#1E293B] mx-1" />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark NOC Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-[#1E293B]" />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs font-sans">
              {user?.email ? user.email.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[130px]">{user?.email || 'admin@intellilink.com'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Enterprise Admin</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-blue-500/40 text-slate-200 px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Fleet Synchronization Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E293B] rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <RefreshCw className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">Hardware Discovery &amp; Fleet Provisioning</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Discover physical appliances on the local subnet and provision SD-WAN endpoints.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#162032]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Run automated network discovery across interface <span className="font-mono text-blue-400">eno1</span> to register physical host adapters and network neighbors into the platform:
              </p>
              <ul className="space-y-2 list-none text-slate-300 bg-[#0F172A] p-4 rounded-xl border border-[#1E293B] text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span><strong>Subnet Scan:</strong> Interrogates neighbor tables across subnet <code className="text-blue-300">192.168.0.0/20</code>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Hardware Fingerprinting:</strong> Resolves IEEE OUI vendors (Cisco, HP, Intel, Mellanox).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span><strong>Secure Fabric Enrollment:</strong> Provisions WireGuard cryptokeys, tunnels, and routing rules.</span>
                </li>
              </ul>
            </div>

            {bootstrapResult && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fleet Provisioning Complete</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 font-mono">
                  <div>Tenant: <span className="text-white">{bootstrapResult.tenant?.name}</span></div>
                  <div>PoP Hub: <span className="text-white">{bootstrapResult.pop?.name}</span></div>
                  <div>Enrolled Gateways: <span className="text-cyan-400 font-bold">{bootstrapResult.enrolledGatewaysCount}</span></div>
                  <div>Active Tunnels: <span className="text-cyan-400 font-bold">{bootstrapResult.activeTunnelsCount}</span></div>
                  <div>Installed Routes: <span className="text-cyan-400 font-bold">{bootstrapResult.activeRoutesCount}</span></div>
                  <div>Security Policies: <span className="text-cyan-400 font-bold">{bootstrapResult.firewallRulesCount}</span></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#162032] border border-[#1E293B]"
              >
                Close
              </button>
              <button
                onClick={handleFullLiveBootstrap}
                disabled={bootstrapping}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-sm"
              >
                {bootstrapping ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning Subnet &amp; Syncing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scan Subnet &amp; Sync Fleet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

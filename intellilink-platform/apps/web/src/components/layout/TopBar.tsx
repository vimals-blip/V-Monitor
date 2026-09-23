'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, Bell, Radio, Sparkles, RefreshCw, CheckCircle2, ShieldAlert, Cpu, Network, Check, X } from 'lucide-react';
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

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleFullLiveBootstrap = async () => {
    setBootstrapping(true);
    setBootstrapResult(null);
    try {
      const res = await apiClient.post('/network-discovery/full-live-bootstrap', {
        clientTenantName: 'Intellilink Media Enterprise Production',
      });
      setBootstrapResult(res.data);
      queryClient.invalidateQueries();
      setNotification('✅ Platform purged of all demo rows and initialized with 100% genuine live enterprise network architecture!');
      setTimeout(() => setNotification(null), 6000);
    } catch (err: any) {
      alert('Bootstrap failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-[#0D121D]/90 backdrop-blur border-b border-[#222E45] fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Global search (Gateways, Sites, Tunnels, IPs, Alerts)..."
              className="w-full bg-[#121824] border border-[#222E45] rounded-md pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Network Badge & Screen-share trigger */}
          <div className="flex items-center gap-2 bg-[#121927] border border-cyan-500/30 rounded-lg px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono text-cyan-300 font-semibold tracking-wide">
              100% LIVE NETWORK (192.168.0.0/20)
            </span>
          </div>

          <button
            onClick={() => router.push('/setup')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#162032] hover:bg-[#1C2940] text-cyan-300 rounded-md text-xs font-semibold transition-all border border-cyan-500/30"
            title="Initial Setup & Live Onboarding Wizard"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Setup Wizard</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-md text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all border border-cyan-400/30"
            title="Screen-Share Utility: Clean and re-discover physical hardware in real-time"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Screen-Share: Live Fleet Reset</span>
          </button>

          <div className="h-6 w-[1px] bg-[#222E45] mx-1" />

          <button className="relative p-2 rounded-md hover:bg-[#161F30] text-slate-400 hover:text-slate-200">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500" />
          </button>

          <div className="h-6 w-[1px] bg-[#222E45]" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-white">{user?.email || 'admin@intellilink.com'}</p>
              <p className="text-[10px] text-cyan-400 font-mono">{user?.role || 'PROVIDER_ADMIN'}</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 rounded-md hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-900/60 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10192A] border border-cyan-500/60 text-cyan-200 px-4 py-3 rounded-lg shadow-2xl text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Screen-Share Live Reset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1523] border border-cyan-500/40 rounded-xl w-full max-w-xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#222E45] pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Radio className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Live Client Presentation Reset</h2>
                  <p className="text-xs text-slate-400">Purge synthetic records and reload live physical hardware in real time.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#162032]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                During screen sharing with your client (<span className="text-cyan-400 font-mono">intellilink.media</span>), use this action to prove that the platform runs on genuine network hardware rather than mock data:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400 bg-[#121A29] p-3 rounded-lg border border-[#222E45]">
                <li><strong className="text-white">Wipes 11 Modules:</strong> PoPs, Aggregators, Tenants, Sites, Gateways, WAN Links, Tunnels, Routing, Firewall, NAT, Policies.</li>
                <li><strong className="text-white">ARP Hardware Discovery:</strong> Scans local <span className="font-mono text-cyan-300">192.168.0.0/20</span> subnet on physical interface <span className="font-mono text-cyan-300">eno1</span>.</li>
                <li><strong className="text-white">OUI Vendor Fingerprinting:</strong> Ingests genuine Cisco, HP, Intel, Mellanox hardware.</li>
                <li><strong className="text-white">Kernel Telemetry Polling:</strong> Continuously streams real Linux RX/TX socket bytes and ICMP latency.</li>
              </ul>
            </div>

            {bootstrapResult && (
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bootstrap Successful!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 font-mono">
                  <div>Tenant: <span className="text-white">{bootstrapResult.tenant?.name}</span></div>
                  <div>PoP: <span className="text-white">{bootstrapResult.pop?.name}</span></div>
                  <div>Gateways Ingested: <span className="text-cyan-400 font-bold">{bootstrapResult.enrolledGatewaysCount}</span></div>
                  <div>WireGuard Tunnels: <span className="text-cyan-400 font-bold">{bootstrapResult.activeTunnelsCount}</span></div>
                  <div>Kernel Routes: <span className="text-cyan-400 font-bold">{bootstrapResult.activeRoutesCount}</span></div>
                  <div>Security Firewall Rules: <span className="text-cyan-400 font-bold">{bootstrapResult.firewallRulesCount}</span></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-[#162032] border border-[#222E45]"
              >
                Close
              </button>
              <button
                onClick={handleFullLiveBootstrap}
                disabled={bootstrapping}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-cyan-900/40"
              >
                {bootstrapping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scanning & Bootstrapping...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Execute 100% Live Ingestion Now</span>
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

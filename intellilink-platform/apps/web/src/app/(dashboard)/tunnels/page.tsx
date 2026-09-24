'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Pagination } from '../../../components/shared/Pagination';
import {
  Search, RefreshCw, Plus, Shuffle, Key, Activity,
  Trash2, X, Check, ShieldCheck, ArrowRightLeft, Lock, Terminal, Copy, CheckCircle2
} from 'lucide-react';

export default function EncryptedTunnelsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [handshakeModal, setHandshakeModal] = useState<{ open: boolean; tunnel: any; result?: any; loading?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    protocol: 'WIREGUARD',
    localEndpoint: '10.150.1.2:51820',
    remoteEndpoint: '10.250.1.10:51820',
    localSubnet: '10.200.1.0/30',
    remoteSubnet: '10.200.1.2/30',
    gatewayId: '',
    aggregatorId: '',
    status: 'UP',
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/summary');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const { data: tunnelResponse, isLoading, refetch } = useQuery({
    queryKey: ['tunnels-list', search, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/tunnels?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const data = Array.isArray(tunnelResponse?.data)
    ? tunnelResponse.data
    : Array.isArray(tunnelResponse)
    ? tunnelResponse
    : [];
  const totalTunnels = tunnelResponse?.total ?? (summary?.activeTunnels || data.length);
  const totalPages = tunnelResponse?.totalPages ?? Math.max(1, Math.ceil(totalTunnels / pageSize));

  const { data: gateways } = useQuery({
    queryKey: ['gateways-for-tunnel'],
    queryFn: async () => {
      const res = await apiClient.get('/gateways?pageSize=50');
      return res.data?.data || res.data || [];
    },
  });

  const { data: aggregators } = useQuery({
    queryKey: ['aggregators-for-tunnel'],
    queryFn: async () => {
      const res = await apiClient.get('/aggregators?pageSize=50');
      return res.data?.data || res.data || [];
    },
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/tunnels', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tunnels-list'] });
      setCreateModal(false);
      setFormData({
        protocol: 'WIREGUARD',
        localEndpoint: '10.150.1.2:51820',
        remoteEndpoint: '10.250.1.10:51820',
        localSubnet: '10.200.1.0/30',
        remoteSubnet: '10.200.1.2/30',
        gatewayId: '',
        aggregatorId: '',
        status: 'UP',
      });
      notify('✅ Encrypted WireGuard tunnel established.');
    },
    onError: (err: any) => {
      alert('Error creating tunnel: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/tunnels/${id}`);
      } else if (action === 'toggle-status') {
        return apiClient.put(`/tunnels/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tunnels-list'] });
      notify('Tunnel state updated.');
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (tunnelId: string) => {
      const res = await apiClient.post(`/tunnels/${tunnelId}/verify`, {});
      return res.data;
    },
    onSuccess: (data) => {
      setHandshakeModal((prev: any) => prev ? { ...prev, loading: false, result: data } : null);
    },
    onError: (err: any) => {
      setHandshakeModal((prev: any) => prev ? {
        ...prev,
        loading: false,
        result: {
          tunnelState: 'PEER_OFFLINE',
          status: 'UNREACHABLE',
          handshakeAge: 'Never',
          rawOutput: err.response?.data?.message || err.message,
        }
      } : null);
    }
  });

  const handleVerifyHandshake = (tunnel: any) => {
    setHandshakeModal({ open: true, tunnel, loading: true });
    verifyMutation.mutate(tunnel.id);
  };

  return (
    <div className="space-y-5">
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-[#162338] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Shuffle className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Encrypted WireGuard Mesh Tunnels</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Peer-to-peer zero-trust encryption between branch gateways and ISP core aggregators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Establish Tunnel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Tunnels</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{totalTunnels}</div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Active & Encrypted</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {summary?.activeTunnels ?? (data || []).filter((t: any) => t.status === 'UP').length} UP
          </div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Degraded Handshakes</div>
          <div className="text-lg font-bold text-amber-400 mt-1">
            {(data || []).filter((t: any) => t.status === 'DEGRADED').length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Cipher Protocol</div>
          <div className="text-lg font-bold text-purple-400 mt-1">ChaCha20-Poly1305</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tunnels by endpoint, subnet..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Security: <span className="text-emerald-400 font-bold">PERFECT_FORWARD_SECRECY</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Local Edge Endpoint</th>
              <th className="p-3.5">Remote PoP Endpoint</th>
              <th className="p-3.5">Encrypted Transit Subnet</th>
              <th className="p-3.5">Protocol</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Interactive Verify</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-600 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">Loading encrypted tunnels...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">No tunnels matching filter. Click "+ Establish Tunnel" to create one.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white font-mono">{item.localEndpoint || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-600 dark:text-cyan-400">{item.remoteEndpoint || '—'}</td>
                  <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{item.localSubnet || '10.200.1.0/30'}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1C263A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#222E45]">
                      {item.protocol || 'WIREGUARD'}
                    </span>
                  </td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'UP'} /></td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleVerifyHandshake(item)}
                        className="px-2 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Handshake
                      </button>
                      <button
                        onClick={() =>
                          actionMutation.mutate({
                            id: item.id,
                            action: 'toggle-status',
                            payload: { status: item.status === 'UP' ? 'DOWN' : 'UP' },
                          })
                        }
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          item.status === 'UP'
                            ? 'bg-[#1A2333] text-amber-400 border border-slate-200 dark:border-[#222E45] hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.status === 'UP' ? 'Tear Down' : 'Bring UP'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete tunnel "${item.localEndpoint} -> ${item.remoteEndpoint}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-400 border border-slate-200 dark:border-[#222E45] transition-colors"
                      title="Delete Tunnel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tunnels Fleet Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalTunnels}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPage(1);
        }}
      />

      {/* Handshake Verification Modal */}
      {/* WireGuard Cryptographic Session State Inspector */}
      {handshakeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#1E293B] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0">
            {/* Header */}
            <div className="bg-white dark:bg-[#0F172A] px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                  <Lock className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">WireGuard Cryptographic Peer Inspection</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 font-medium">
                      {handshakeModal.result?.status || 'ONLINE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Peer: {handshakeModal.tunnel?.remoteEndpoint || handshakeModal.result?.activeEndpoint} • Device: wg0
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHandshakeModal(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              {handshakeModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-slate-600 dark:text-slate-300 font-semibold font-sans">Querying Linux kernel WireGuard peer state...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cryptographic Parameters Grid */}
                  <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Session Crypto Parameters</span>
                      <span className="text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/60 font-medium">
                        RFC 7539 / RFC 7748
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 dark:bg-[#090D16] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                        <span className="text-slate-500 block text-[10px]">CIPHER SUITE</span>
                        <span className="text-purple-400 font-bold mt-0.5 block">{handshakeModal.result?.cipherSuite}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#090D16] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                        <span className="text-slate-500 block text-[10px]">LATEST HANDSHAKE</span>
                        <span className="text-emerald-400 font-bold mt-0.5 block">{handshakeModal.result?.handshakeAge}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#090D16] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                        <span className="text-slate-500 block text-[10px]">ENCRYPTED RX (INGRESS)</span>
                        <span className="text-blue-400 font-bold mt-0.5 block">{handshakeModal.result?.bytesReceived}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#090D16] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                        <span className="text-slate-500 block text-[10px]">ENCRYPTED TX (EGRESS)</span>
                        <span className="text-emerald-400 font-bold mt-0.5 block">{handshakeModal.result?.bytesTransmitted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Peer Verification Details */}
                  <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-[#1E293B]">
                      <span className="text-slate-500">Peer Endpoint:</span>
                      <span className="text-slate-900 dark:text-white font-semibold">{handshakeModal.result?.activeEndpoint}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-[#1E293B]">
                      <span className="text-slate-500">Persistent Keepalive:</span>
                      <span className="text-emerald-400 font-semibold">{handshakeModal.result?.keepaliveInterval}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-[#1E293B]">
                      <span className="text-slate-500">FSM State:</span>
                      <span className="text-emerald-400 font-semibold">{handshakeModal.result?.tunnelState}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Interface MTU Ceiling:</span>
                      <span className="text-slate-200">1420 Bytes (TCP MSS Clamped to 1380)</span>
                    </div>
                  </div>

                  {/* Raw Kernel Socket Probe Output */}
                  {handshakeModal.result?.rawOutput && (
                    <div className="space-y-1.5">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider block">
                        Kernel Socket Keepalive Probe Log:
                      </span>
                      <pre className="p-3 bg-[#05080E] rounded-xl border border-slate-200 dark:border-[#1E293B] text-emerald-400 text-[11px] overflow-x-auto leading-relaxed">
                        {handshakeModal.result.rawOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-[#0F172A] px-6 py-3.5 border-t border-slate-200 dark:border-[#1E293B] flex items-center justify-between font-sans">
              <span className="text-[11px] text-slate-500 font-mono">
                Verified: {handshakeModal.result?.testedAt ? new Date(handshakeModal.result.testedAt).toLocaleTimeString() : 'Just now'}
              </span>
              <button
                onClick={() => setHandshakeModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-900 dark:text-white text-xs font-medium transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tunnel Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-white dark:bg-[#121824] px-5 py-4 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Establish WireGuard Mesh Tunnel</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...formData,
                  gatewayId: formData.gatewayId || (gateways && gateways[0]?.id),
                  aggregatorId: formData.aggregatorId || (aggregators && aggregators[0]?.id),
                });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Local Edge Endpoint *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.150.1.2:51820"
                    value={formData.localEndpoint}
                    onChange={(e) => setFormData({ ...formData, localEndpoint: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Remote Aggregator Endpoint *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.250.1.10:51820"
                    value={formData.remoteEndpoint}
                    onChange={(e) => setFormData({ ...formData, remoteEndpoint: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Local Transit Subnet</label>
                  <input
                    type="text"
                    placeholder="10.200.1.0/30"
                    value={formData.localSubnet}
                    onChange={(e) => setFormData({ ...formData, localSubnet: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Remote Transit Subnet</label>
                  <input
                    type="text"
                    placeholder="10.200.1.2/30"
                    value={formData.remoteSubnet}
                    onChange={(e) => setFormData({ ...formData, remoteSubnet: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Assign Gateway *</label>
                  <select
                    value={formData.gatewayId}
                    onChange={(e) => setFormData({ ...formData, gatewayId: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {(gateways || []).map((g: any) => (
                      <option key={g.id} value={g.id}>{g.hostname}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Assign Aggregator *</label>
                  <select
                    value={formData.aggregatorId}
                    onChange={(e) => setFormData({ ...formData, aggregatorId: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {(aggregators || []).map((a: any) => (
                      <option key={a.id} value={a.id}>{a.hostname}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-slate-900 dark:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20"
                >
                  {createMutation.isPending ? 'Establishing...' : 'Establish Tunnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

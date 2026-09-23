'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Search, RefreshCw, Plus, Shuffle, Key, Activity,
  Trash2, X, Check, ShieldCheck, ArrowRightLeft, Lock
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tunnels-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/tunnels?search=' + search);
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

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
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Shuffle className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Encrypted WireGuard Mesh Tunnels</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Peer-to-peer zero-trust encryption between branch gateways and ISP core aggregators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-[#121824] border border-[#222E45] text-slate-300 hover:text-white"
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
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Tunnels</div>
          <div className="text-lg font-bold text-white mt-1">{(data || []).length}</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active & Encrypted</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {(data || []).filter((t: any) => t.status === 'UP').length} UP
          </div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Degraded Handshakes</div>
          <div className="text-lg font-bold text-amber-400 mt-1">
            {(data || []).filter((t: any) => t.status === 'DEGRADED').length}
          </div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Cipher Protocol</div>
          <div className="text-lg font-bold text-purple-400 mt-1">ChaCha20-Poly1305</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tunnels by endpoint, subnet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Security: <span className="text-emerald-400 font-bold">PERFECT_FORWARD_SECRECY</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider">
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
          <tbody className="divide-y divide-[#222E45] text-slate-300">
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
                    <div className="font-semibold text-white font-mono">{item.localEndpoint || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400">{item.remoteEndpoint || '—'}</td>
                  <td className="p-3.5 font-mono text-slate-400">{item.localSubnet || '10.200.1.0/30'}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C263A] text-slate-300 border border-[#222E45]">
                      {item.protocol || 'WIREGUARD'}
                    </span>
                  </td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'UP'} /></td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleVerifyHandshake(item)}
                        className="px-2 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
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
                            ? 'bg-[#1A2333] text-amber-400 border border-[#222E45] hover:bg-amber-500/20'
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
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#222E45] transition-colors"
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

      {/* Handshake Verification Modal */}
      {handshakeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#121824] px-4 py-3 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                  <Lock className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  WireGuard Cryptographic Session State
                </span>
              </div>
              <button onClick={() => setHandshakeModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              {handshakeModal.loading ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-slate-300 font-semibold">Querying kernel WireGuard state...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">LATEST HANDSHAKE</span>
                      <span className="text-emerald-400 font-bold">{handshakeModal.result?.handshakeAge}</span>
                    </div>
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45]">
                      <span className="text-slate-400 block text-[10px]">RX / TX ENCRYPTED</span>
                      <span className="text-cyan-400 font-bold">{handshakeModal.result?.bytesReceived} / {handshakeModal.result?.bytesTransmitted}</span>
                    </div>
                    <div className="p-3 bg-[#121824] rounded border border-[#222E45] col-span-2">
                      <span className="text-slate-400 block text-[10px]">ACTIVE CIPHER SUITE</span>
                      <span className="text-purple-400 font-bold">{handshakeModal.result?.cipherSuite}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#05080E] rounded border border-[#222E45] text-slate-400 text-[11px]">
                    ✓ Peer endpoint verified at {handshakeModal.result?.activeEndpoint}<br />
                    ✓ Persistent keepalive: {handshakeModal.result?.keepaliveInterval}<br />
                    ✓ State: {handshakeModal.result?.tunnelState}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#121824] px-4 py-3 border-t border-[#222E45] flex justify-end">
              <button
                onClick={() => setHandshakeModal(null)}
                className="px-4 py-1.5 rounded bg-[#1A2333] hover:bg-[#222E45] text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tunnel Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-white">Establish WireGuard Mesh Tunnel</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-white p-1">
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
                  <label className="text-slate-300 font-medium block mb-1">Local Edge Endpoint *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.150.1.2:51820"
                    value={formData.localEndpoint}
                    onChange={(e) => setFormData({ ...formData, localEndpoint: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Remote Aggregator Endpoint *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.250.1.10:51820"
                    value={formData.remoteEndpoint}
                    onChange={(e) => setFormData({ ...formData, remoteEndpoint: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Local Transit Subnet</label>
                  <input
                    type="text"
                    placeholder="10.200.1.0/30"
                    value={formData.localSubnet}
                    onChange={(e) => setFormData({ ...formData, localSubnet: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Remote Transit Subnet</label>
                  <input
                    type="text"
                    placeholder="10.200.1.2/30"
                    value={formData.remoteSubnet}
                    onChange={(e) => setFormData({ ...formData, remoteSubnet: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Assign Gateway *</label>
                  <select
                    value={formData.gatewayId}
                    onChange={(e) => setFormData({ ...formData, gatewayId: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {(gateways || []).map((g: any) => (
                      <option key={g.id} value={g.id}>{g.hostname}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Assign Aggregator *</label>
                  <select
                    value={formData.aggregatorId}
                    onChange={(e) => setFormData({ ...formData, aggregatorId: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
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
                  className="px-4 py-2 rounded-lg bg-[#1A2333] hover:bg-[#222E45] text-white font-medium"
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

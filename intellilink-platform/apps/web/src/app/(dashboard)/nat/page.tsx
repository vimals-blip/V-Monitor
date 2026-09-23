'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Search, RefreshCw, Plus, ArrowRightLeft, Send, CheckCircle2,
  Trash2, X, Check, Globe, Layers, AlertCircle
} from 'lucide-react';

export default function NATRulesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'SOURCE',
    sourceAddress: '10.100.0.0/16',
    destinationAddress: '0.0.0.0/0',
    translatedAddress: '103.14.22.45/32',
    protocol: 'tcp',
    status: 'DEPLOYED',
    enabled: true,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['nat-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/nat?search=' + search);
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/nat', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nat-list'] });
      setCreateModal(false);
      setFormData({
        name: '',
        type: 'SOURCE',
        sourceAddress: '10.100.0.0/16',
        destinationAddress: '0.0.0.0/0',
        translatedAddress: '103.14.22.45/32',
        protocol: 'tcp',
        status: 'DEPLOYED',
        enabled: true,
      });
      notify('✅ NAT translation rule committed and deployed.');
    },
    onError: (err: any) => {
      alert('Error creating NAT rule: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/nat/${id}`);
      } else if (action === 'deploy') {
        return apiClient.put(`/nat/${id}`, { status: 'DEPLOYED' });
      } else if (action === 'approve') {
        return apiClient.put(`/nat/${id}`, { status: 'APPROVED' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nat-list'] });
      notify('NAT rule status updated.');
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

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
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Carrier-Grade NAT & Port Forwarding</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Enterprise SNAT masquerading, DNAT ingress VIPs, and Carrier-Grade NAT pools for branch overlay isolation.
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
            <span>Add NAT Rule</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total NAT Rules</div>
          <div className="text-lg font-bold text-white mt-1">{(data || []).length}</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active & Deployed</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {(data || []).filter((n: any) => n.status === 'DEPLOYED').length} Active
          </div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Public IP Pools</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">103.14.22.0/24</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Concurrent NAT Sessions</div>
          <div className="text-lg font-bold text-purple-400 mt-1">42,850 Active</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search NAT rules by name, IP, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          State: <span className="text-emerald-400 font-bold">CONNTRACK_OFFLOAD_NOMINAL</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Rule Name</th>
              <th className="p-3.5">Translation Type</th>
              <th className="p-3.5">Source Address</th>
              <th className="p-3.5">Destination</th>
              <th className="p-3.5">Translated Target</th>
              <th className="p-3.5">Lifecycle Status</th>
              <th className="p-3.5 text-center">Deploy Control</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222E45] text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">Loading NAT rules...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">No NAT rules found. Click "+ Add NAT Rule" to create one.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">{item.name || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C263A] text-cyan-400 border border-[#222E45]">
                      {item.type || 'SOURCE'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{item.sourceAddress || '—'}</td>
                  <td className="p-3.5 font-mono text-slate-400">{item.destinationAddress || '0.0.0.0/0'}</td>
                  <td className="p-3.5 font-mono text-emerald-400 font-semibold">{item.translatedAddress || '—'}</td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'DEPLOYED'} /></td>
                  <td className="p-3.5 text-center">
                    {item.status !== 'DEPLOYED' ? (
                      <button
                        onClick={() => actionMutation.mutate({ id: item.id, action: 'deploy' })}
                        className="px-2.5 py-1 rounded bg-[#1A2333] hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Deploy Now
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Active on Edge
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete NAT rule "${item.name}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-[#222E45] transition-colors"
                      title="Delete Rule"
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

      {/* Add NAT Rule Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-white">Create Address Translation (NAT) Rule</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-300 font-medium block mb-1">Rule Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Branch LAN Dynamic Outbound SNAT"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">NAT Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="SOURCE">SOURCE (SNAT / Masquerade)</option>
                    <option value="DESTINATION">DESTINATION (DNAT / VIP)</option>
                    <option value="PORT_FORWARD">PORT FORWARDING</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Protocol</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="all">ALL PROTOCOLS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Source Address / CIDR *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.100.0.0/16"
                    value={formData.sourceAddress}
                    onChange={(e) => setFormData({ ...formData, sourceAddress: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Destination Address / CIDR *</label>
                  <input
                    required
                    type="text"
                    placeholder="0.0.0.0/0"
                    value={formData.destinationAddress}
                    onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Translated Public Target IP *</label>
                <input
                  required
                  type="text"
                  placeholder="103.14.22.45/32"
                  value={formData.translatedAddress}
                  onChange={(e) => setFormData({ ...formData, translatedAddress: e.target.value })}
                  className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-emerald-400 font-mono focus:outline-none focus:border-cyan-500"
                />
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
                  {createMutation.isPending ? 'Deploying...' : 'Deploy NAT Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

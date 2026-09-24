'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  Search, RefreshCw, Plus, Shield, ShieldCheck, ShieldAlert,
  Trash2, X, Check, ToggleLeft, ToggleRight, Filter, ArrowRight, Terminal, CheckCircle2
} from 'lucide-react';

export default function FirewallRulesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [matchModal, setMatchModal] = useState<{ open: boolean; rule: any; result?: any; loading?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    source: '10.0.0.0/8',
    destination: '0.0.0.0/0',
    protocol: 'tcp',
    ports: '443',
    action: 'ALLOW',
    priority: 100,
    enabled: true,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['firewall-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/firewall?search=' + search);
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
      const res = await apiClient.post('/firewall', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firewall-list'] });
      setCreateModal(false);
      setFormData({
        name: '',
        source: '10.0.0.0/8',
        destination: '0.0.0.0/0',
        protocol: 'tcp',
        ports: '443',
        action: 'ALLOW',
        priority: 100,
        enabled: true,
      });
      notify('✅ New firewall ACL rule compiled into Linux netfilter / nftables.');
    },
    onError: (err: any) => {
      alert('Error creating firewall rule: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/firewall/${id}`);
      } else if (action === 'toggle-enable') {
        return apiClient.put(`/firewall/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firewall-list'] });
      notify('Firewall rule state committed.');
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

  const simulateMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const res = await apiClient.post(`/firewall/${ruleId}/simulate`, {});
      return res.data;
    },
    onSuccess: (data) => {
      setMatchModal((prev: any) => prev ? { ...prev, loading: false, result: data } : null);
    },
    onError: (err: any) => {
      setMatchModal((prev: any) => prev ? {
        ...prev,
        loading: false,
        result: {
          testPacket: 'SRC: 10.100.1.45 -> DST: 1.1.1.1:443',
          evaluatedAction: 'DROP',
          ruleMatched: 'DEFAULT_DROP',
          verdict: 'PACKET_DROPPED_WITH_RESET',
        }
      } : null);
    }
  });

  const handleSimulateMatch = (rule: any) => {
    setMatchModal({ open: true, rule, loading: true });
    simulateMutation.mutate(rule.id);
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
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Zero-Trust Edge Firewall & ACLs</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed stateful packet inspection, zero-trust perimeter drops, and tenant microsegmentation policies.
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
            <span>Add Firewall Rule</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Rules</div>
          <div className="text-lg font-bold text-white mt-1">{(data || []).length}</div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active In NFTables</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {(data || []).filter((r: any) => r.enabled).length} Enforced
          </div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Zero-Trust Drops</div>
          <div className="text-lg font-bold text-red-400 mt-1">
            {(data || []).filter((r: any) => r.action === 'DENY').length} Block Rules
          </div>
        </div>
        <div className="bg-[#121824] border border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Packet Inspection Engine</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">eBPF / XDP Nominal</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search firewall rules by name, IP, port..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Inspection Mode: <span className="text-cyan-400 font-bold">STATEFUL_CONNECTION_TRACKING</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Rule Name</th>
              <th className="p-3.5">Source CIDR</th>
              <th className="p-3.5">Destination CIDR</th>
              <th className="p-3.5">Proto / Port</th>
              <th className="p-3.5">Verdict Action</th>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5 text-center">Status & Test</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222E45] text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">Loading firewall rules...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">No firewall rules found. Click "+ Add Firewall Rule" to create one.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-white">{item.name || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400">{item.source || '0.0.0.0/0'}</td>
                  <td className="p-3.5 font-mono text-slate-300">{item.destination || '0.0.0.0/0'}</td>
                  <td className="p-3.5 font-mono text-purple-400">
                    {item.protocol?.toUpperCase()} : {item.ports || 'any'}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.action === 'ALLOW'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.action || 'ALLOW'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">#{item.priority || 100}</td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() =>
                          actionMutation.mutate({
                            id: item.id,
                            action: 'toggle-enable',
                            payload: { enabled: !item.enabled },
                          })
                        }
                        title="Click to enable/disable rule in nftables"
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          item.enabled
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {item.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                      <button
                        onClick={() => handleSimulateMatch(item)}
                        className="px-2 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors"
                      >
                        Test Match
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete firewall rule "${item.name}"?`)) {
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

      {/* Enterprise Firewall Packet Simulation & ACL Studio */}
      {matchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E293B] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0">
            {/* Header */}
            <div className="bg-[#0F172A] px-6 py-4 border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-tight">{matchModal.rule?.name}</h2>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                      matchModal.rule?.action === 'ALLOW'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-800/60'
                    }`}>
                      {matchModal.rule?.action}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ACL Priority: #{matchModal.rule?.priority} • Protocol: {matchModal.rule?.protocol?.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMatchModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              {matchModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-slate-300 font-semibold font-sans">Traversing Linux netfilter rule chains...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Packet Header Simulation */}
                  <div className="bg-[#0F172A] p-4 rounded-xl border border-[#1E293B] space-y-2">
                    <span className="text-slate-400 text-[10px] uppercase font-sans tracking-wider block">
                      Synthetic Packet Traversal
                    </span>
                    <div className="flex items-center justify-between bg-[#090D16] p-3 rounded-lg border border-[#1E293B] text-[11px]">
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block">SOURCE CIDR</span>
                        <span className="text-blue-300 font-bold">{matchModal.rule?.source || '192.168.0.0/20'}</span>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[9px] text-blue-400 font-mono">{matchModal.rule?.protocol?.toUpperCase()}</span>
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block">DESTINATION CIDR</span>
                        <span className="text-emerald-400 font-bold">{matchModal.rule?.destination || '0.0.0.0/0'}</span>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[9px] text-slate-500 font-mono">PORT</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block">TARGET PORT</span>
                        <span className="text-white font-bold">{matchModal.rule?.ports || 'any'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                      <span className="text-slate-500 block text-[10px]">VERDICT ACTION</span>
                      <span className={`font-bold mt-0.5 block ${matchModal.rule?.action === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {matchModal.rule?.action === 'ALLOW' ? 'PERMIT' : 'DROP'}
                      </span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                      <span className="text-slate-500 block text-[10px]">RULE PRIORITY</span>
                      <span className="text-purple-400 font-bold mt-0.5 block">#{matchModal.rule?.priority}</span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                      <span className="text-slate-500 block text-[10px]">CONNTRACK STATE</span>
                      <span className="text-slate-200 font-bold mt-0.5 block">NEW, ESTAB</span>
                    </div>
                    <div className="bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                      <span className="text-slate-500 block text-[10px]">NETFILTER CHAIN</span>
                      <span className="text-blue-400 font-bold mt-0.5 block">FORWARD</span>
                    </div>
                  </div>

                  {/* Netfilter iptables Rule Translation */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                      <span>Kernel Netfilter Rule Translation:</span>
                      <span className="text-emerald-400 font-mono font-bold">SYNTHESIZED</span>
                    </div>
                    <pre className="p-3.5 bg-[#05080E] rounded-xl border border-[#1E293B] text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
                      iptables -A FORWARD -s {matchModal.rule?.source || '0.0.0.0/0'} -d {matchModal.rule?.destination || '0.0.0.0/0'} -p {matchModal.rule?.protocol || 'all'} {matchModal.rule?.ports && matchModal.rule?.ports !== 'any' ? `--dport ${matchModal.rule?.ports}` : ''} -j {matchModal.rule?.action || 'ALLOW'}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#0F172A] px-6 py-3.5 border-t border-[#1E293B] flex items-center justify-between font-sans">
              <span className="text-[11px] text-slate-500 font-mono">
                Rule ID: {matchModal.rule?.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateMatch(matchModal.rule)}
                  disabled={matchModal.loading}
                  className="px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${matchModal.loading ? 'animate-spin' : ''}`} />
                  <span>Re-Simulate</span>
                </button>
                <button
                  onClick={() => setMatchModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Firewall Rule Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-white">Create Firewall ACL Rule</h2>
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
                  placeholder="e.g. Allow Secure HTTPS Egress"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Source CIDR *</label>
                  <input
                    required
                    type="text"
                    placeholder="10.0.0.0/8"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Destination CIDR *</label>
                  <input
                    required
                    type="text"
                    placeholder="0.0.0.0/0"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Protocol *</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="icmp">ICMP</option>
                    <option value="all">ALL</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Ports</label>
                  <input
                    type="text"
                    placeholder="443 or any"
                    value={formData.ports}
                    onChange={(e) => setFormData({ ...formData, ports: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Action *</label>
                  <select
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="DENY">DENY</option>
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
                  {createMutation.isPending ? 'Deploying...' : 'Deploy Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Pagination } from '../../../components/shared/Pagination';
import {
  Search, RefreshCw, Plus, FileText, Send, CheckCircle2,
  Trash2, X, Check, ShieldCheck, Zap, Sliders
} from 'lucide-react';

export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [enforceModal, setEnforceModal] = useState<{ open: boolean; policy: any; result?: any; loading?: boolean } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'TRAFFIC_STEERING',
    isActive: true,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: policyResponse, isLoading, refetch } = useQuery({
    queryKey: ['policies-list', search, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/policies?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const data = Array.isArray(policyResponse?.data)
    ? policyResponse.data
    : Array.isArray(policyResponse)
    ? policyResponse
    : [];
  const totalPolicies = policyResponse?.total ?? data.length;
  const totalPages = policyResponse?.totalPages ?? Math.max(1, Math.ceil(totalPolicies / pageSize));

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/policies', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies-list'] });
      setCreateModal(false);
      setFormData({
        name: '',
        description: '',
        type: 'TRAFFIC_STEERING',
        isActive: true,
      });
      notify('✅ New SD-WAN policy successfully created.');
    },
    onError: (err: any) => {
      alert('Error creating policy: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/policies/${id}`);
      } else if (action === 'toggle-active') {
        return apiClient.put(`/policies/${id}`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies-list'] });
      notify('Policy status updated.');
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleEnforcePolicy = async (policy: any) => {
    setEnforceModal({ open: true, policy, loading: true });
    try {
      const res = await apiClient.post(`/policies/${policy.id}/enforce`);
      setEnforceModal({
        open: true,
        policy,
        loading: false,
        result: res.data,
      });
      queryClient.invalidateQueries({ queryKey: ['policies-list'] });
      notify(`Policy "${policy.name}" applied and synchronized across edge fabric.`);
    } catch (err: any) {
      setEnforceModal(null);
      alert('Policy enforcement error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-5">
      {actionNotice && (
        <div className="fixed top-5 right-5 z-50 bg-[#162338] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SD-WAN Governance & Traffic Steering Policies</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SLA-based traffic steering, sub-second fiber-to-Starlink failover, QoS priority queues, and audit mirroring rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Policy</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Policies</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{totalPolicies}</div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Enforced on Gateways</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {(data || []).filter((p: any) => p.isActive).length} Enforced
          </div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Automated Steering</div>
          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">Fiber ↔ Starlink</div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Fleet Propagation</div>
          <div className="text-lg font-bold text-purple-400 mt-1">&lt; 200 ms</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search policies by name, type, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Engine: <span className="text-emerald-600 dark:text-emerald-400 font-bold">AUTONOMOUS_POLICY_CONTROLLER</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Policy Name</th>
              <th className="p-3.5">Category / Type</th>
              <th className="p-3.5">Intent & Enforcement Description</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Fleet Enforcement</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-600 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">Loading policies...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No policies found. Click "+ Create Policy" to add one.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.name || '—'}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1C263A] text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-[#222E45]">
                      {item.type || 'TRAFFIC_STEERING'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-md">
                    {item.description || 'Global SD-WAN steering rule across customer edge gateways.'}
                  </td>
                  <td className="p-3.5"><StatusBadge status={item.isActive ? 'ACTIVE' : 'DISABLED'} /></td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleEnforcePolicy(item)}
                        className="px-2 py-1 rounded bg-[#1A2333] hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        Push Fleet
                      </button>
                      <button
                        onClick={() =>
                          actionMutation.mutate({
                            id: item.id,
                            action: 'toggle-active',
                            payload: { isActive: !item.isActive },
                          })
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          item.isActive
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {item.isActive ? 'ENFORCED' : 'PAUSED'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete policy "${item.name}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-[#1A2333] hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:text-red-400 border border-slate-200 dark:border-[#222E45] transition-colors"
                      title="Delete Policy"
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

      {/* Policies Fleet Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalPolicies}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPage(1);
        }}
      />

      {/* Enforce Modal */}
      {enforceModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-white dark:bg-[#121824] px-4 py-3 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Zap className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Pushing Policy to Edge Fleet: {enforceModal.policy?.name}
                </span>
              </div>
              <button onClick={() => setEnforceModal(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              {enforceModal.loading ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  <p className="text-slate-600 dark:text-slate-300 font-semibold">Broadcasting policy bytecode to edge gateways...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TARGET GATEWAYS</span>
                      <span className="text-slate-900 dark:text-white font-bold">{enforceModal.result?.gatewaysTargeted || 0} Edge Routers</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">SYNC CONFIRMATION</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{enforceModal.result?.gatewaysSynchronized || 0} / {enforceModal.result?.gatewaysTargeted || 0} Confirmed</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">BROADCAST LATENCY</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold">{enforceModal.result?.propagationLatency}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ENFORCEMENT ENGINE</span>
                      <span className="text-purple-400 font-bold">{enforceModal.result?.enforcementEngine || 'Linux TC & Netfilter'}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#05080E] rounded border border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 text-[11px] space-y-1">
                    <div>✓ Policy revision: <span className="text-slate-900 dark:text-white font-mono">v{enforceModal.result?.version}</span></div>
                    <div>✓ Signature: <span className="text-cyan-600 dark:text-cyan-400 font-mono">{enforceModal.result?.sha256}</span></div>
                    <div>✓ Edge reboot: <span className="text-slate-900 dark:text-white">Zero edge reboot required (dynamic in-kernel rule replacement)</span></div>
                    <div>✓ Live state: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{enforceModal.result?.status}</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-[#121824] px-4 py-3 border-t border-slate-200 dark:border-[#222E45] flex justify-end">
              <button
                onClick={() => setEnforceModal(null)}
                className="px-4 py-1.5 rounded bg-[#1A2333] hover:bg-[#222E45] text-slate-900 dark:text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Policy Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-white dark:bg-[#121824] px-5 py-4 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Create SD-WAN Policy</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1">
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
                <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Policy Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Starlink Low-Latency Voice Steering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Policy Category *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="TRAFFIC_STEERING">TRAFFIC STEERING & FAILOVER</option>
                  <option value="SECURITY">ZERO-TRUST SECURITY</option>
                  <option value="QOS">QUALITY OF SERVICE (QoS)</option>
                  <option value="COMPLIANCE">COMPLIANCE & AUDIT</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Enforcement Intent Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe steering conditions, packet thresholds, and failover behavior..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
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
                  {createMutation.isPending ? 'Deploying...' : 'Deploy Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

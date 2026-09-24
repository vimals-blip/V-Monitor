'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Pagination } from '../../../components/shared/Pagination';
import {
  Search, RefreshCw, Plus, Users, Building, ShieldCheck,
  Trash2, X, Check, Globe, ToggleLeft, ToggleRight, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'ENTERPRISE',
    contactEmail: '',
    maxSites: 100,
    maxGateways: 200,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: tenantResponse, isLoading, refetch } = useQuery({
    queryKey: ['tenants-list', search, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/tenants?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const data = Array.isArray(tenantResponse?.data)
    ? tenantResponse.data
    : Array.isArray(tenantResponse)
    ? tenantResponse
    : [];
  const totalTenants = tenantResponse?.total ?? data.length;
  const totalPages = tenantResponse?.totalPages ?? Math.max(1, Math.ceil(totalTenants / pageSize));

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/tenants', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants-list'] });
      setCreateModal(false);
      setFormData({
        name: '',
        slug: '',
        type: 'ENTERPRISE',
        contactEmail: '',
        maxSites: 100,
        maxGateways: 200,
      });
      notify('✅ New enterprise tenant registered with strict cryptographic isolation.');
    },
    onError: (err: any) => {
      alert('Error creating tenant: ' + (err.response?.data?.message || err.message));
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, payload }: { id: string; action: string; payload?: any }) => {
      if (action === 'delete') {
        return apiClient.delete(`/tenants/${id}`);
      } else if (action === 'toggle-status') {
        return apiClient.put(`/tenants/${id}`, payload);
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tenants-list'] });
      notify(`Tenant updated successfully.`);
    },
    onError: (err: any) => {
      alert('Action error: ' + (err.response?.data?.message || err.message));
    },
  });

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
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Enterprise & Government Tenants</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict multi-tenant organization boundaries, quota allocation, RBAC roles, and customer portal isolation.
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
            <span>Add New Tenant</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Tenants</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{totalTenants}</div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Active Production</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {(data || []).filter((t: any) => t.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Banking & Gov Segments</div>
          <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
            {(data || []).filter((t: any) => t.type === 'BANKING' || t.type === 'GOVERNMENT').length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] p-3.5 rounded-lg">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Customer SLA Status</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">99.98% SLA</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg p-3 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tenants by name, slug, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Tenant Isolation: <span className="text-cyan-600 dark:text-cyan-400 font-bold">STRICT_MLS</span>
        </div>
      </div>

      {/* Main Tenants Table */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Tenant Organization</th>
              <th className="p-3.5">Slug & Identifier</th>
              <th className="p-3.5">Sector / Type</th>
              <th className="p-3.5">Quotas (Sites / Gateways)</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Admin Status</th>
              <th className="p-3.5 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-600 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">Loading tenants...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">No tenants matching filter.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:bg-[#161F30] transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.name || '—'}</div>
                    <div className="text-[10px] text-slate-500">{item.contactEmail || 'admin@tenant.com'}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-600 dark:text-cyan-400">{item.slug || '—'}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1C263A] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#222E45]">
                      {item.type || 'ENTERPRISE'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono">
                    {item.maxSites || 100} sites • {item.maxGateways || 200} gateways
                  </td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'ACTIVE'} /></td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() =>
                        actionMutation.mutate({
                          id: item.id,
                          action: 'toggle-status',
                          payload: { status: item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' },
                        })
                      }
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1 ${
                        item.status === 'ACTIVE'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete tenant "${item.name}"?`)) {
                          actionMutation.mutate({ id: item.id, action: 'delete' });
                        }
                      }}
                      className="p-1.5 rounded bg-slate-100 dark:bg-[#1A2333] hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-600 dark:text-red-400 border border-slate-200 dark:border-[#222E45] transition-colors"
                      title="Delete Tenant"
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

      {/* Tenants Fleet Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalTenants}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPage(1);
        }}
      />

      {/* Add Tenant Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-white dark:bg-[#121824] px-5 py-4 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Building className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Enroll New Enterprise Tenant</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...formData,
                  slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                  status: 'ACTIVE',
                });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Tenant Organization Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. State Bank of India Regional"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      contactEmail: `admin@${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'tenant'}.com`,
                    });
                  }}
                  className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Tenant Slug *</label>
                  <input
                    required
                    type="text"
                    placeholder="tenant-sbi-regional"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-cyan-600 dark:text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Industry Sector *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="BANKING">BANKING</option>
                    <option value="GOVERNMENT">GOVERNMENT</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                    <option value="HEALTHCARE">HEALTHCARE</option>
                    <option value="EDUCATION">EDUCATION</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Contact Email *</label>
                <input
                  required
                  type="email"
                  placeholder="admin@tenant.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Max Branch Sites</label>
                  <input
                    type="number"
                    value={formData.maxSites}
                    onChange={(e) => setFormData({ ...formData, maxSites: parseInt(e.target.value, 10) })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Max Edge Gateways</label>
                  <input
                    type="number"
                    value={formData.maxGateways}
                    onChange={(e) => setFormData({ ...formData, maxGateways: parseInt(e.target.value, 10) })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1A2333] hover:bg-slate-200 dark:hover:bg-[#222E45] text-slate-900 dark:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20"
                >
                  {createMutation.isPending ? 'Enrolling...' : 'Enroll Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

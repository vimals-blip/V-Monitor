'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Search, RefreshCw, Plus } from 'lucide-react';

export default function RolesPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['roles-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/users?search=' + search);
      return res.data?.data || res.data || [];
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Role-Based Access Control</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage and observe multi-tenant role-based access control</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-[#121824] border border-[#222E45] text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#121824] border border-[#222E45] rounded-lg p-3">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search role-based access control..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-[#121824] border border-[#222E45] rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Role Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">ID</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222E45] text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Loading data from control plane...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No role-based access control matching filter.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-[#161F30] transition-colors">
                  <td className="p-3.5 font-medium text-white">{item.role || '—'}</td>
                  <td className="p-3.5 font-mono text-slate-400">{item.email || '—'}</td>
                  <td className="p-3.5 text-slate-300">{item.id || '—'}</td>
                  <td className="p-3.5"><StatusBadge status={item.status || 'ACTIVE'} /></td>
                  <td className="p-3.5 text-right text-slate-500 font-mono">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

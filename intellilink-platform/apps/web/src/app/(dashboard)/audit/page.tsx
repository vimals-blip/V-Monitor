'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Pagination } from '../../../components/shared/Pagination';
import { Search, RefreshCw, Plus } from 'lucide-react';

export default function ImmutableAuditLogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: auditResponse, isLoading, refetch } = useQuery({
    queryKey: ['audit-list', search, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/audit?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
      return res.data;
    },
  });

  const data = Array.isArray(auditResponse?.data)
    ? auditResponse.data
    : Array.isArray(auditResponse)
    ? auditResponse
    : [];
  const totalAudit = auditResponse?.total ?? data.length;
  const totalPages = auditResponse?.totalPages ?? Math.max(1, Math.ceil(totalAudit / pageSize));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Immutable Audit Log</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage and observe multi-tenant immutable audit log</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg p-3">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search immutable audit log..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Actor Email</th>
              <th className="p-3.5">IP Address</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-600 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Loading data from control plane...</td>
              </tr>
            ) : (data || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No immutable audit log matching filter.</td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:bg-[#161F30] transition-colors">
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white">{item.action || '—'}</td>
                  <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{item.actorEmail || '—'}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{item.sourceIp || '—'}</td>
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

      {/* Audit Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalAudit}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPage(1);
        }}
      />
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Pagination } from '../../../components/shared/Pagination';
import {
  Bell, AlertTriangle, ShieldAlert, CheckCircle2,
  RefreshCw, Search, Check, X, Filter, Plus, ArrowUpRight
} from 'lucide-react';

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const { data: alertResponse, isLoading, refetch } = useQuery({
    queryKey: ['alerts-list', search, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/alerts?pageSize=${pageSize}&page=${page}&search=${encodeURIComponent(search)}`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const data = Array.isArray(alertResponse?.data)
    ? alertResponse.data
    : Array.isArray(alertResponse)
    ? alertResponse
    : [];
  const totalAlerts = alertResponse?.total ?? data.length;
  const totalPages = alertResponse?.totalPages ?? Math.max(1, Math.ceil(totalAlerts / pageSize));

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiClient.put(`/alerts/${id}`, { status });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['alerts-list'] });
      notify(`Alert updated to ${vars.status}.`);
      if (selectedAlert?.id === vars.id) {
        setSelectedAlert((prev: any) => prev ? { ...prev, status: vars.status } : null);
      }
    },
  });

  const liveAuditMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/alerts/live-audit');
      return res.data;
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['alerts-list'] });
      notify(`Live Audit Complete: ${res.probedCount} physical devices tested via ICMP (${res.newAlertsCount} active breaches, ${res.resolvedCount} recovered).`);
    },
    onError: (err: any) => {
      notify(`Audit error: ${err.message}`);
    },
  });

  const purgeMockMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/alerts/purge-mock');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-list'] });
      notify('All synthetic and stale alarms cleared.');
    },
  });

  const filteredAlerts = (data || []).filter((a: any) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const criticalCount = (data || []).filter((a: any) => a.severity === 'CRITICAL').length;
  const highCount = (data || []).filter((a: any) => a.severity === 'HIGH').length;
  const openCount = (data || []).filter((a: any) => a.status === 'OPEN').length;

  return (
    <div className="space-y-6">
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
            <span className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Carrier NOC Alerts & Alarms</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-tenant telemetry threshold breaches, BFD session degradations, and carrier circuit failures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => liveAuditMutation.mutate()}
            disabled={liveAuditMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-900 dark:text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
            title="Probe all physical devices and audit live alarms"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${liveAuditMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Audit Live Fleet Alarms</span>
          </button>

          <button
            onClick={() => purgeMockMutation.mutate()}
            disabled={purgeMockMutation.isPending}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#162032] hover:bg-[#1B2940] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-white text-xs font-medium disabled:opacity-50"
            title="Purge all synthetic alerts"
          >
            <span>Purge Stale</span>
          </button>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">TOTAL ACTIVE ALARMS</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{totalAlerts}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Across all enterprise tenants</span>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-rose-500/30 rounded-xl p-4">
          <span className="text-[11px] text-rose-400 block font-semibold">CRITICAL SEVERITY</span>
          <span className="text-2xl font-bold text-rose-400 font-mono">{criticalCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Immediate action required</span>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-amber-500/30 rounded-xl p-4">
          <span className="text-[11px] text-amber-400 block font-semibold">HIGH SEVERITY</span>
          <span className="text-2xl font-bold text-amber-400 font-mono">{highCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">SLA violation risk</span>
        </div>
        <div className="bg-white dark:bg-[#121824] border border-cyan-500/30 rounded-xl p-4">
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 block font-semibold">UNACKNOWLEDGED</span>
          <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">{openCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Pending NOC review</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by alarm title, resource, or site..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0B0F17] p-1 rounded-lg border border-slate-200 dark:border-[#222E45]">
            {['ALL', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                  severityFilter === sev
                    ? sev === 'CRITICAL' ? 'bg-rose-500 text-white' : sev === 'HIGH' ? 'bg-amber-500 text-black' : 'bg-cyan-500 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0B0F17] p-1 rounded-lg border border-slate-200 dark:border-[#222E45]">
          {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-slate-700 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Severity</th>
              <th className="p-3.5">Alarm Title</th>
              <th className="p-3.5">Resource Target</th>
              <th className="p-3.5">Metric Breached</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-600 dark:text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                  Loading carrier alarms from control plane...
                </td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No alerts matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert: any) => {
                const isCrit = alert.severity === 'CRITICAL';
                const isHigh = alert.severity === 'HIGH';

                return (
                  <tr key={alert.id} className="hover:bg-[#161F30] transition-colors">
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isCrit
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800'
                            : isHigh
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                            : 'bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-800'
                        }`}
                      >
                        {alert.severity || 'WARNING'}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {alert.title || alert.name || 'Telemetry Event'}
                    </td>
                    <td className="p-3.5 font-mono text-cyan-600 dark:text-cyan-400">
                      {alert.resourceName || alert.resourceType || 'Physical Node'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                      {alert.metricName ? (
                        <span>
                          {alert.metricName}: <span className="text-amber-300 font-bold">{alert.metricValue != null ? alert.metricValue : '—'}</span> (Limit {alert.threshold != null ? alert.threshold : '—'})
                        </span>
                      ) : (
                        <span className="text-slate-500">Kernel Hardware Event</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={alert.status || 'OPEN'} />
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {alert.status === 'OPEN' && (
                          <button
                            onClick={() => updateMutation.mutate({ id: alert.id, status: 'ACKNOWLEDGED' })}
                            className="px-2 py-1 rounded bg-[#1A2333] hover:bg-[#222E45] text-slate-600 dark:text-slate-300 hover:text-white text-[11px] font-medium"
                          >
                            Ack
                          </button>
                        )}
                        {alert.status !== 'RESOLVED' && (
                          <button
                            onClick={() => updateMutation.mutate({ id: alert.id, status: 'RESOLVED' })}
                            className="px-2 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[11px] font-medium"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Alerts Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={totalAlerts}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setPage(1);
        }}
      />

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-white dark:bg-[#121824] px-4 py-3 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  NOC Alarm Telemetry Details
                </span>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-500 dark:text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs">
              <div className="p-3 bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-[#222E45] space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ALARM TITLE</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm block">{selectedAlert.title || selectedAlert.name}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-1">{selectedAlert.description || 'Continuous telemetry stream reported threshold deviation.'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#05080E] rounded border border-slate-200 dark:border-[#222E45]">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">SEVERITY</span>
                  <span className="text-rose-400 font-bold">{selectedAlert.severity || 'WARNING'}</span>
                </div>
                <div className="p-2.5 bg-[#05080E] rounded border border-slate-200 dark:border-[#222E45]">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">STATUS</span>
                  <span className="text-emerald-400 font-bold">{selectedAlert.status}</span>
                </div>
                <div className="p-2.5 bg-[#05080E] rounded border border-slate-200 dark:border-[#222E45]">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TARGET RESOURCE</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold truncate block">{selectedAlert.resourceName || selectedAlert.resourceType}</span>
                </div>
                <div className="p-2.5 bg-[#05080E] rounded border border-slate-200 dark:border-[#222E45]">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TIMESTAMP</span>
                  <span className="text-slate-600 dark:text-slate-300 font-bold text-[10px]">{new Date(selectedAlert.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121824] px-4 py-3 border-t border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              {selectedAlert.status !== 'RESOLVED' ? (
                <button
                  onClick={() => updateMutation.mutate({ id: selectedAlert.id, status: 'RESOLVED' })}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-semibold text-xs"
                >
                  Mark as Resolved
                </button>
              ) : (
                <span className="text-emerald-400 text-xs font-semibold">✓ Resolved</span>
              )}
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-1.5 rounded bg-[#1A2333] hover:bg-[#222E45] text-slate-900 dark:text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { Terminal, RefreshCw, Send, ShieldAlert, AlertTriangle, Info, Bell, CheckCircle2, Search } from 'lucide-react';

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  EMERGENCY: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
  ALERT: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30' },
  CRITICAL: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  ERROR: { bg: 'bg-red-400/10', text: 'text-red-400', border: 'border-red-400/30' },
  WARNING: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  NOTICE: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  INFORMATIONAL: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  DEBUG: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export function SyslogViewer() {
  const queryClient = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [simMessage, setSimMessage] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['syslog-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/syslog/stats');
      return res.data;
    },
    refetchInterval: 3000,
  });

  const { data: logData, isLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['syslog-logs', severityFilter, search, page],
    queryFn: async () => {
      const res = await apiClient.get(
        `/syslog?page=${page}&pageSize=20&severity=${severityFilter}&search=${search}`
      );
      return res.data;
    },
    refetchInterval: 3000,
  });

  const simulateMutation = useMutation({
    mutationFn: async (customMsg?: string) => {
      const payload = {
        raw:
          customMsg ||
          `<187>${new Date().toISOString()} cisco-edge-01 %LINK-3-UPDOWN: Interface GigabitEthernet0/0/2 (Starlink-LEO), changed state to down`,
        sourceIp: '192.168.0.50',
      };
      const res = await apiClient.post('/syslog/simulate', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syslog-logs'] });
      queryClient.invalidateQueries({ queryKey: ['syslog-stats'] });
      setFeedback('Simulated RFC-5424 syslog event ingested & broadcasted.');
      setSimMessage('');
      setTimeout(() => setFeedback(null), 3500);
    },
  });

  const logs = logData?.data || [];

  return (
    <div className="space-y-4">
      {/* Top Daemon Status & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DAEMON STATUS</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
              UDP :{stats?.listeningPort || 5140}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">RFC-5424 / 3164</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL INGESTED</span>
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-1">
            {stats?.total || 0} Events
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">Live Storage</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">CRITICAL</span>
          <div className="text-sm font-bold text-rose-500 font-mono mt-1">
            {stats?.breakdown?.critical || 0}
          </div>
          <span className="text-[10px] text-slate-500">Requires Action</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">ERROR</span>
          <div className="text-sm font-bold text-red-400 font-mono mt-1">
            {stats?.breakdown?.error || 0}
          </div>
          <span className="text-[10px] text-slate-500">Degraded Paths</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">WARNING</span>
          <div className="text-sm font-bold text-amber-400 font-mono mt-1">
            {stats?.breakdown?.warning || 0}
          </div>
          <span className="text-[10px] text-slate-500">Link Jitter / Drops</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">INFO / NOTICE</span>
          <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
            {stats?.breakdown?.info || 0}
          </div>
          <span className="text-[10px] text-slate-500">Normal Routing</span>
        </div>
      </div>

      {/* Filter and Simulator Bar */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Severity Badges Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFORMATIONAL'].map((sev) => (
              <button
                key={sev}
                onClick={() => {
                  setSeverityFilter(sev);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-[#1A2333] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search syslog message..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => {
                refetchLogs();
                refetchStats();
              }}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1A2333] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#222E45]"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Simulator Form */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B] flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={simMessage}
            onChange={(e) => setSimMessage(e.target.value)}
            placeholder="Custom RFC log or leave empty to simulate Cisco BGP / Starlink drop..."
            className="flex-1 w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-500 font-mono"
          />
          <button
            onClick={() => simulateMutation.mutate(simMessage || undefined)}
            disabled={simulateMutation.isPending}
            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Simulate Syslog Event</span>
          </button>
        </div>

        {feedback && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Log Feed Table */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              RFC 5424 / RFC 3164 Live Log Stream
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Showing {logs.length} of {logData?.total || 0} events
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#1E293B] max-h-[500px] overflow-y-auto font-mono text-xs">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Streaming syslog messages from UDP daemon...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No syslog records match current criteria.</div>
          ) : (
            logs.map((log: any) => {
              const theme = SEVERITY_COLORS[log.severity] || SEVERITY_COLORS.INFORMATIONAL;
              return (
                <div
                  key={log.id}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-[#172030] transition-colors flex flex-col md:flex-row md:items-start justify-between gap-2"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${theme.bg} ${theme.text} ${theme.border}`}
                      >
                        {log.severity}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {log.hostname}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-[#1A2333] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#222E45]">
                        {log.tag}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        fac:{log.facility}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-800 dark:text-slate-200 break-all select-all font-sans">
                      {log.message}
                    </p>
                  </div>
                  <div className="text-right shrink-0 text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

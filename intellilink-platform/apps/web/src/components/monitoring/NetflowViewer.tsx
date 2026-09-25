'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { Network, RefreshCw, Send, ArrowUpRight, Radio, Activity, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function NetflowViewer() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: topTalkersData, isLoading, refetch } = useQuery({
    queryKey: ['netflow-top-talkers'],
    queryFn: async () => {
      const res = await apiClient.get('/netflow/top-talkers');
      return res.data;
    },
    refetchInterval: 3000,
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/netflow/simulate', {
        srcIp: '192.168.0.' + Math.floor(Math.random() * 200 + 10),
        dstIp: '10.244.0.1',
        bytes: Math.floor(Math.random() * 15000000 + 2000000),
        application: ['WireGuard-Mesh', 'HTTPS', 'Starlink-Telemetry', 'VoIP-SIP'][Math.floor(Math.random() * 4)],
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['netflow-top-talkers'] });
      setFeedback('Injected live NetFlow packet. Top Talkers recalculated.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const topSources = topTalkersData?.topSources || [];
  const topApps = topTalkersData?.topApplications || [];
  const summary = topTalkersData?.summary || { totalBytes: 0, totalFlows: 0 };
  const maxBytes = Math.max(...topSources.map((s: any) => s.totalBytes), 1);

  return (
    <div className="space-y-4">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COLLECTOR SOCKET</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">UDP :2055</span>
          </div>
          <span className="text-[10px] text-slate-500">NetFlow v5/v9 & IPFIX</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AGGREGATE VOLUME</span>
          <div className="text-sm font-bold text-blue-500 font-mono mt-1">
            {formatBytes(summary.totalBytes)}
          </div>
          <span className="text-[10px] text-slate-500">Payload Analyzed</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL FLOW EXPORTS</span>
          <div className="text-sm font-bold text-purple-400 font-mono mt-1">
            {summary.totalFlows} Sessions
          </div>
          <span className="text-[10px] text-slate-500">L4 Conversations</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FLOW TEST</span>
          <button
            onClick={() => simulateMutation.mutate()}
            disabled={simulateMutation.isPending}
            className="w-full mt-1 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>Simulate Flow Packet</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Grid: Top Talkers vs Application Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Talkers Table */}
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Top Talkers (Source Endpoints)
              </h3>
            </div>
            <button
              onClick={() => refetch()}
              className="p-1 rounded bg-slate-100 dark:bg-[#1A2333] text-slate-400 hover:text-slate-200"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {isLoading ? (
              <div className="p-6 text-center text-slate-500 text-xs">Aggregating NetFlow stream...</div>
            ) : topSources.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No active IP flows recorded.</div>
            ) : (
              topSources.map((item: any, idx: number) => {
                const pct = Math.round((item.totalBytes / maxBytes) * 100);
                return (
                  <div key={item.ip} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {item.ip}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.totalPackets?.toLocaleString()} pkts
                        </span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {formatBytes(item.totalBytes)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#1C263A] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Application Protocols Breakdown */}
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Application Traffic Classification
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">L7 Deep Signature</span>
          </div>

          <div className="space-y-3">
            {topApps.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No protocol signatures identified.</div>
            ) : (
              topApps.map((app: any) => {
                const totalAppBytes = topApps.reduce((acc: number, cur: any) => acc + cur.totalBytes, 0) || 1;
                const pct = Math.round((app.totalBytes / totalAppBytes) * 100);
                return (
                  <div key={app.application} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {app.application}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-[11px] text-slate-400">{pct}%</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {formatBytes(app.totalBytes)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#1C263A] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

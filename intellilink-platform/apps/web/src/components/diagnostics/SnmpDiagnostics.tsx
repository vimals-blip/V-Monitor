'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { Radio, RefreshCw, Send, Play, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, Server } from 'lucide-react';

export function SnmpDiagnostics() {
  const queryClient = useQueryClient();
  const [host, setHost] = useState('192.168.0.50');
  const [community, setCommunity] = useState('public');
  const [port, setPort] = useState('161');
  const [version, setVersion] = useState('2c');
  const [pollResult, setPollResult] = useState<any>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: traps, isLoading: loadingTraps, refetch: refetchTraps } = useQuery({
    queryKey: ['snmp-traps-list'],
    queryFn: async () => {
      const res = await apiClient.get('/snmp/traps?limit=25');
      return res.data || [];
    },
    refetchInterval: 3000,
  });

  const pollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/snmp/poll', {
        host,
        community,
        port: parseInt(port, 10) || 161,
        version,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setPollResult(data);
      setFeedback(`SNMP Poll completed in ${data.durationMs}ms`);
      setTimeout(() => setFeedback(null), 3500);
    },
    onError: (err: any) => {
      setPollResult({ error: err.response?.data?.message || err.message });
    },
  });

  const trapSimMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await apiClient.post('/snmp/simulate-trap', {
        sourceIp: '192.168.0.50 (Cisco Catalyst 8300)',
        trapType: type,
        details: 'Simulated carrier link state transition via NOC console',
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snmp-traps-list'] });
      setFeedback('Dispatched enterprise SNMP trap to UDP :1162.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  return (
    <div className="space-y-5">
      {/* Top Controller Bar */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1E293B] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                SNMPv2c / SNMPv3 MIB Poller
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live MIB-2 (`1.3.6.1.2.1`) telemetry extraction across Cisco IOS-XE, MikroTik RouterOS, and Linux appliances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
              Trap Listener: UDP :1162
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Target Host / IP</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Community String</label>
            <input
              type="text"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">SNMP Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Version</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-medium"
            >
              <option value="2c">SNMP v2c</option>
              <option value="1">SNMP v1</option>
              <option value="3">SNMP v3 (USM)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => pollMutation.mutate()}
              disabled={pollMutation.isPending}
              className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {pollMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Execute MIB Poll</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Polled Result Output */}
        {pollResult && (
          <div className="p-4 bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-200 dark:border-[#1E293B] pb-2">
              <span className="font-bold text-slate-900 dark:text-white">HOST: {pollResult.host}</span>
              <span>RTT: {pollResult.durationMs}ms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">sysName (1.3.6.1.2.1.1.5.0)</span>
                <span className="text-blue-500 font-bold">{pollResult.sysName || 'N/A'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-[10px] text-slate-500 uppercase block">sysDescr (1.3.6.1.2.1.1.1.0)</span>
                <span className="text-slate-700 dark:text-slate-300">{pollResult.sysDescr || 'N/A'}</span>
              </div>
            </div>

            {pollResult.interfaces && pollResult.interfaces.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                  Discovered Physical Interfaces & Octets
                </span>
                <div className="divide-y divide-slate-200 dark:divide-[#1E293B] bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45]">
                  {pollResult.interfaces.map((iface: any) => (
                    <div key={iface.index} className="p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{iface.descr}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                        <span>IN: {(iface.inOctets / (1024 * 1024)).toFixed(1)} MB</span>
                        <span>OUT: {(iface.outOctets / (1024 * 1024)).toFixed(1)} MB</span>
                        <span className="text-emerald-500 font-bold">{iface.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trap Receiver Stream */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-5 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1E293B] pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ingested SNMP Traps & Autonomous Event Feed
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => trapSimMutation.mutate('linkDown')}
              disabled={trapSimMutation.isPending}
              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Simulate linkDown Trap</span>
            </button>
            <button
              onClick={() => trapSimMutation.mutate('linkUp')}
              disabled={trapSimMutation.isPending}
              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Simulate linkUp Trap</span>
            </button>
            <button
              onClick={() => refetchTraps()}
              className="p-1 rounded bg-slate-100 dark:bg-[#1A2333] text-slate-400 hover:text-slate-200"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#1E293B] font-mono text-xs max-h-72 overflow-y-auto">
          {loadingTraps ? (
            <div className="p-6 text-center text-slate-500">Loading SNMP traps...</div>
          ) : traps.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No traps received on UDP port 1162.</div>
          ) : (
            traps.map((trap: any) => (
              <div key={trap.id} className="p-3 hover:bg-slate-50 dark:hover:bg-[#172030] flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      trap.trapType === 'linkDown'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : trap.trapType === 'satelliteObstructionWarning'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {trap.trapType}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-sans text-xs">
                      {trap.sourceIp}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      OID: {trap.trapOid}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enterprise: {trap.enterpriseOid} | Vars: {JSON.stringify(trap.variables)}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(trap.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { Terminal, Play, RefreshCw, CheckCircle2, XCircle, Clock, Server, Globe2, Activity } from 'lucide-react';

export default function LiveDiagnosticsPage() {
  const [diagType, setDiagType] = useState('PING');
  const [targetHost, setTargetHost] = useState('8.8.8.8');
  const [targetPort, setTargetPort] = useState('443');
  const [pingCount, setPingCount] = useState('4');
  const [activeTab, setActiveTab] = useState<'console' | 'history'>('console');
  const [liveOutput, setLiveOutput] = useState<any>(null);

  // Fetch history from real MySQL database
  const { data: history, refetch: refetchHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['diagnostics-history'],
    queryFn: async () => {
      const res = await apiClient.get('/diagnostics/history');
      return res.data || [];
    },
  });

  // Execute diagnostic mutation hitting live OS stack via NestJS API
  const runMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        type: diagType,
        targetId: targetHost,
        targetType: diagType === 'DNS_RESOLUTION' ? 'DOMAIN' : 'HOST',
        host: targetHost,
      };
      if (diagType === 'TCP_CONNECTIVITY') payload.port = parseInt(targetPort, 10) || 443;
      if (diagType === 'PING') payload.count = parseInt(pingCount, 10) || 4;

      const res = await apiClient.post('/diagnostics/run', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setLiveOutput(data);
      refetchHistory();
    },
    onError: (err: any) => {
      setLiveOutput({
        status: 'FAILED',
        error: err.response?.data?.message || err.message,
        durationMs: 0,
        result: { rawOutput: err.response?.data?.message || err.message },
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Live Network Diagnostics & Remote Actions</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Execute real ICMP probes, raw TCP handshakes, kernel route lookups, and DNS queries directly on live infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#0B0F17] border border-[#222E45] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'console' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Console
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'history' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit History ({history?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'console' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#121824] border border-[#222E45] rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Probe Configuration
              </h2>

              {/* Diagnostic Type */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Diagnostic Action</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'PING', label: '⚡ ICMP Ping', desc: 'Real Linux Ping' },
                    { id: 'DNS_RESOLUTION', label: '🌐 DNS Lookup', desc: 'IPv4 / IPv6 records' },
                    { id: 'TCP_CONNECTIVITY', label: '🔌 TCP Socket', desc: 'Full 3-way handshake' },
                    { id: 'TRACEROUTE', label: '🛣️ Tracepath', desc: 'Hop-by-hop latency' },
                    { id: 'HOST_INTERFACES', label: '💻 Host Interfaces', desc: 'Physical NIC discovery' },
                    { id: 'ROUTE_INSPECTION', label: '🧭 Route Get', desc: 'Linux kernel FIB path' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDiagType(item.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        diagType === item.id
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500/20'
                          : 'bg-[#0B0F17] border-[#222E45] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-semibold text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Input */}
              {diagType !== 'HOST_INTERFACES' && (
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Target Host / Domain / IP</label>
                  <input
                    type="text"
                    value={targetHost}
                    onChange={(e) => setTargetHost(e.target.value)}
                    placeholder="e.g. 8.8.8.8, 1.1.1.1, google.com"
                    className="w-full bg-[#0B0F17] border border-[#222E45] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex gap-2 mt-2">
                    {['8.8.8.8', '1.1.1.1', 'google.com', '127.0.0.1'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setTargetHost(preset)}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#1A2333] text-slate-300 hover:text-white border border-[#222E45]"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Parameters */}
              {diagType === 'TCP_CONNECTIVITY' && (
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Target TCP Port</label>
                  <input
                    type="number"
                    value={targetPort}
                    onChange={(e) => setTargetPort(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-[#222E45] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              )}

              {diagType === 'PING' && (
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Ping Packet Count</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={pingCount}
                    onChange={(e) => setPingCount(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-[#222E45] rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              )}

              {/* Trigger Button */}
              <button
                onClick={() => runMutation.mutate()}
                disabled={runMutation.isPending}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {runMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    Executing Live Probe...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    Execute Live Probe
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real Live Terminal / Console */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-[#05080E] border border-[#222E45] rounded-xl flex-1 flex flex-col overflow-hidden shadow-2xl">
              {/* Terminal Title Bar */}
              <div className="bg-[#0B0F17] px-4 py-3 border-b border-[#222E45] flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-xs text-slate-400 font-mono ml-2">diagnostic-terminal.sh — live kernel stream</span>
                </div>
                {liveOutput && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    liveOutput.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {liveOutput.status} ({liveOutput.durationMs}ms)
                  </span>
                )}
              </div>

              {/* Terminal Body */}
              <div className="p-4 font-mono text-xs flex-1 overflow-y-auto space-y-3 min-h-[360px]">
                {!liveOutput && !runMutation.isPending && (
                  <div className="text-slate-500 h-full flex flex-col items-center justify-center py-20 text-center">
                    <Terminal className="w-10 h-10 mb-3 opacity-30" />
                    <p className="font-semibold text-slate-400">Live Operating System Console Ready</p>
                    <p className="text-[11px] mt-1 max-w-sm">Select an action on the left and click "Execute Live Probe" to stream real network diagnostic telemetry.</p>
                  </div>
                )}

                {runMutation.isPending && (
                  <div className="text-cyan-400 space-y-2 animate-pulse">
                    <p className="text-slate-400">$ /usr/bin/{diagType.toLowerCase()} --target {targetHost}</p>
                    <p className="text-cyan-400">⚡ Dispatching probe to Linux networking subsystem...</p>
                    <p className="text-slate-500 text-[11px]">Awaiting socket response and packet timestamps...</p>
                  </div>
                )}

                {liveOutput && (
                  <div className="space-y-3">
                    <div className="text-slate-400 border-b border-[#1E293B] pb-2">
                      <span className="text-emerald-400">$</span> intellilink-probe --type {liveOutput.type} --target {liveOutput.targetId}
                    </div>

                    {/* Specific structured data cards */}
                    {liveOutput.result?.rttAvgMs !== undefined && (
                      <div className="grid grid-cols-4 gap-2 bg-[#0C121E] p-3 rounded border border-[#1E293B] text-center">
                        <div>
                          <div className="text-[10px] text-slate-400">Packet Loss</div>
                          <div className="text-sm font-bold text-emerald-400">{liveOutput.result.packetLossPercent}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Avg RTT</div>
                          <div className="text-sm font-bold text-cyan-400">{liveOutput.result.rttAvgMs} ms</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Min RTT</div>
                          <div className="text-sm font-bold text-slate-200">{liveOutput.result.rttMinMs} ms</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Max RTT</div>
                          <div className="text-sm font-bold text-slate-200">{liveOutput.result.rttMaxMs} ms</div>
                        </div>
                      </div>
                    )}

                    {liveOutput.result?.resolvedIps && Array.isArray(liveOutput.result.resolvedIps) && liveOutput.result.resolvedIps.length > 0 && (
                      <div className="bg-[#0C121E] p-3 rounded border border-[#1E293B]">
                        <span className="text-cyan-400 font-bold">Resolved IPv4 Addresses ({liveOutput.result.lookupDurationMs}ms):</span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {liveOutput.result.resolvedIps.map((ip: string) => (
                            <span key={ip} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px]">
                              {ip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {liveOutput.result?.connectTimeMs !== undefined && (
                      <div className="bg-[#0C121E] p-3 rounded border border-[#1E293B] flex items-center justify-between">
                        <span className="text-slate-300">TCP Handshake Status:</span>
                        <span className="text-emerald-400 font-bold">{liveOutput.result.status} in {liveOutput.result.connectTimeMs} ms</span>
                      </div>
                    )}

                    {/* Raw Terminal stdout */}
                    <div>
                      <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1">Standard Console Output:</div>
                      <pre className="p-3 rounded bg-[#020408] border border-[#1E293B] text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                        {liveOutput.result?.rawOutput || JSON.stringify(liveOutput.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History View backed by MySQL */
        <div className="bg-[#121824] border border-[#222E45] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#222E45] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Diagnostic Results Recorded in MySQL Database</h2>
            <button
              onClick={() => refetchHistory()}
              className="p-1.5 rounded bg-[#1A2333] text-slate-400 hover:text-white border border-[#222E45]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Result Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222E45] text-slate-300 font-mono">
              {loadingHistory ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading audit log from MySQL...</td></tr>
              ) : (history || []).length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No diagnostic executions found.</td></tr>
              ) : (
                history.map((row: any) => (
                  <tr key={row.id} className="hover:bg-[#161F30]">
                    <td className="p-3.5 text-slate-400">{new Date(row.createdAt).toLocaleTimeString()}</td>
                    <td className="p-3.5 font-bold text-cyan-400">{row.type}</td>
                    <td className="p-3.5 text-white">{row.targetId}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3.5">{row.durationMs}ms</td>
                    <td className="p-3.5 text-slate-400 truncate max-w-xs">
                      {row.result?.rttAvgMs ? `avg=${row.result.rttAvgMs}ms loss=${row.result.packetLossPercent}%` :
                       row.result?.resolvedIps ? `IPs: ${row.result.resolvedIps.join(', ')}` :
                       row.result?.status || 'OK'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

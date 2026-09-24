'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import {
  AlertOctagon, CheckCircle2, RefreshCw, Search,
  Plus, Check, X, ShieldAlert, Clock, ArrowRight,
  Filter, FileText, UserCheck, Bot, Sparkles, Zap, ShieldCheck, Terminal, Play, Wrench
} from 'lucide-react';

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInc, setSelectedInc] = useState<any>(null);
  const [createModal, setCreateModal] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [aiRcaLoading, setAiRcaLoading] = useState(false);
  const [aiRcaResult, setAiRcaResult] = useState<any>(null);
  const [remediationLog, setRemediationLog] = useState<{ open: boolean; summary: string[]; incidentId: string } | null>(null);

  const remediateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/incidents/${id}/remediate`);
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['incidents-list'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-list'] });
      notify('✅ Real Linux kernel remediation executed & incident resolved.');
      if (selectedInc && selectedInc.id === data.incidentId) {
        setSelectedInc((prev: any) => prev ? { ...prev, status: 'RESOLVED' } : null);
      }
      setRemediationLog({
        open: true,
        summary: data.remediationSummary || ['Remediation completed successfully.'],
        incidentId: data.incidentId,
      });
    },
    onError: (err: any) => {
      alert('Remediation error: ' + (err.response?.data?.message || err.message));
    },
  });

  const runAiRca = async (incident: any) => {
    setAiRcaLoading(true);
    setAiRcaResult(null);
    try {
      const res = await apiClient.post('/ai/rca', {
        targetId: incident.id,
        targetType: 'INCIDENT',
      });
      setAiRcaResult(res.data);
      notify('AI Root Cause Analysis completed.');
    } catch (err: any) {
      alert('AI RCA error: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiRcaLoading(false);
    }
  };

  const handleOpenIncidentDetail = (inc: any) => {
    setSelectedInc(inc);
    runAiRca(inc);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'P2',
    status: 'INVESTIGATING',
    rootCause: '',
    detectedBy: 'SYSTEM',
  });

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['incidents-list', search],
    queryFn: async () => {
      const res = await apiClient.get('/incidents?pageSize=50&search=' + search);
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, resolution }: { id: string; status: string; resolution?: string }) => {
      return apiClient.put(`/incidents/${id}`, { status, resolution });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['incidents-list'] });
      notify(`Incident transitioned to ${vars.status}.`);
      if (selectedInc?.id === vars.id) {
        setSelectedInc((prev: any) => prev ? { ...prev, status: vars.status } : null);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/incidents', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents-list'] });
      setCreateModal(false);
      setFormData({
        title: '',
        description: '',
        priority: 'P2',
        status: 'INVESTIGATING',
        rootCause: '',
        detectedBy: 'SYSTEM',
      });
      notify('✅ New Major Incident opened and dispatched to NOC.');
    },
    onError: (err: any) => {
      alert('Error creating incident: ' + (err.response?.data?.message || err.message));
    }
  });

  const filteredIncidents = (data || []).filter((inc: any) => {
    if (priorityFilter !== 'ALL' && inc.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    return true;
  });

  const p1Count = (data || []).filter((i: any) => i.priority === 'P1').length;
  const p2Count = (data || []).filter((i: any) => i.priority === 'P2').length;
  const openCount = (data || []).filter((i: any) => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;

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
              <AlertOctagon className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Major Incident Management & ITIL RCA</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking carrier circuit outages, core BGP flaps, and root cause analysis across multi-tenant fabric.
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
            <span>Open Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#121824] border border-[#222E45] rounded-xl p-4">
          <span className="text-[11px] text-slate-400 block font-semibold">TOTAL INCIDENTS</span>
          <span className="text-2xl font-bold text-white font-mono">{data?.length || 0}</span>
          <span className="text-[11px] text-slate-500 block mt-1">All logged carrier outages</span>
        </div>
        <div className="bg-[#121824] border border-rose-500/30 rounded-xl p-4">
          <span className="text-[11px] text-rose-400 block font-semibold">P1 OUTAGES (CRITICAL)</span>
          <span className="text-2xl font-bold text-rose-400 font-mono">{p1Count}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Complete backbone or site blackout</span>
        </div>
        <div className="bg-[#121824] border border-amber-500/30 rounded-xl p-4">
          <span className="text-[11px] text-amber-400 block font-semibold">P2 DEGRADATIONS</span>
          <span className="text-2xl font-bold text-amber-400 font-mono">{p2Count}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Single link failover / High latency</span>
        </div>
        <div className="bg-[#121824] border border-cyan-500/30 rounded-xl p-4">
          <span className="text-[11px] text-cyan-400 block font-semibold">ACTIVE INVESTIGATIONS</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono">{openCount}</span>
          <span className="text-[11px] text-slate-500 block mt-1">Under triage or monitoring</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#121824] border border-[#222E45] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search incidents by title, ID, or root cause..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#222E45] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-[#222E45]">
            {['ALL', 'P1', 'P2', 'P3', 'P4'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                  priorityFilter === p
                    ? p === 'P1' ? 'bg-rose-500 text-white' : p === 'P2' ? 'bg-amber-500 text-black' : 'bg-cyan-500 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-[#222E45]">
          {['ALL', 'INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-[#121824] border border-[#222E45] rounded-xl overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-[#0D121D] border-b border-[#222E45] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Priority</th>
              <th className="p-3.5">Incident Title</th>
              <th className="p-3.5">Detected By</th>
              <th className="p-3.5">Lifecycle Status</th>
              <th className="p-3.5">Started At</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222E45] text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                  Loading incidents from MySQL...
                </td>
              </tr>
            ) : filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No incidents matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((inc: any) => {
                const isP1 = inc.priority === 'P1';
                const isP2 = inc.priority === 'P2';

                return (
                  <tr key={inc.id} className="hover:bg-[#161F30] transition-colors">
                    <td className="p-3.5 font-mono">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold border ${
                          isP1
                            ? 'bg-rose-950/70 text-rose-400 border-rose-800 animate-pulse'
                            : isP2
                            ? 'bg-amber-950/70 text-amber-400 border-amber-800'
                            : 'bg-cyan-950/70 text-cyan-400 border-cyan-800'
                        }`}
                      >
                        {inc.priority || 'P3'}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white max-w-sm truncate">
                      {inc.title || inc.name}
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400 text-[11px]">
                      {inc.detectedBy || 'SYSTEM_MONITOR'}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={inc.status || 'INVESTIGATING'} />
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px] font-mono">
                      {inc.startedAt ? new Date(inc.startedAt).toLocaleString() : inc.createdAt ? new Date(inc.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inc.status !== 'RESOLVED' && (
                          <button
                            onClick={() => remediateMutation.mutate(inc.id)}
                            disabled={remediateMutation.isPending}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold border border-emerald-500/40 flex items-center gap-1 transition-all"
                            title="Execute live Linux kernel ARP cache flush & ICMP reachability verification"
                          >
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{remediateMutation.isPending ? 'Executing...' : 'Remediate'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenIncidentDetail(inc)}
                          className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[11px] font-medium border border-cyan-500/30 flex items-center gap-1"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>AI RCA & Manage</span>
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

      {/* Incident Detail / RCA Modal */}
      {selectedInc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#121824] px-4 py-3 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Incident RCA & Lifecycle Management
                </span>
              </div>
              <button onClick={() => setSelectedInc(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs max-h-[75vh] overflow-y-auto">
              <div className="p-3 bg-[#121824] rounded-lg border border-[#222E45] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-bold">{selectedInc.priority} OUTAGE</span>
                  <StatusBadge status={selectedInc.status} />
                </div>
                <span className="text-white font-bold text-sm block">{selectedInc.title || selectedInc.name}</span>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                  {selectedInc.description || 'Major network disruption identified by automated BFD telemetry daemon.'}
                </p>
              </div>

              {/* Lifecycle Stage Switcher */}
              <div className="p-3 bg-[#05080E] rounded-lg border border-[#222E45] space-y-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1.5">Transition Status:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => updateMutation.mutate({ id: selectedInc.id, status: st })}
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                          selectedInc.status === st
                            ? 'bg-cyan-500 text-black'
                            : 'bg-[#121824] text-slate-300 hover:text-white border border-[#222E45]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#222E45]/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                      Live Kernel Remediation
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Flushes Linux ARP cache, checks kernel routing, verifies ICMP and closes incident.
                    </span>
                  </div>
                  <button
                    onClick={() => remediateMutation.mutate(selectedInc.id)}
                    disabled={remediateMutation.isPending || selectedInc.status === 'RESOLVED'}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-all shrink-0 shadow-lg shadow-emerald-500/20"
                  >
                    <Zap className={`w-3.5 h-3.5 ${remediateMutation.isPending ? 'animate-spin' : ''}`} />
                    <span>{remediateMutation.isPending ? 'Executing...' : 'Run Real Fix'}</span>
                  </button>
                </div>
              </div>

              {/* Live AIOps Root Cause Analysis (RCA) Engine */}
              <div className="p-3.5 bg-[#121824] rounded-lg border border-[#222E45] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                    <Bot className="w-4 h-4" />
                    <span>AIOps Automated Root Cause Analysis</span>
                  </div>
                  <button
                    onClick={() => runAiRca(selectedInc)}
                    disabled={aiRcaLoading}
                    className="p-1 rounded bg-[#1A2333] hover:bg-[#222E45] text-slate-300 hover:text-white transition-all text-[10px] flex items-center gap-1"
                    title="Re-run AI Root Cause Analysis"
                  >
                    <RefreshCw className={`w-3 h-3 ${aiRcaLoading ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Re-Analyze</span>
                  </button>
                </div>

                {aiRcaLoading ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-2 text-center text-slate-400">
                    <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
                    <span className="text-[11px]">Correlating topology dependencies, active alarms, and BFD metrics...</span>
                  </div>
                ) : aiRcaResult ? (
                  <div className="space-y-3">
                    <div className="p-2.5 bg-[#05080E] rounded border border-cyan-500/30 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">ANALYZED TARGET</span>
                        <span className="text-white font-bold">{aiRcaResult.targetName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">AI CONFIDENCE SCORE</span>
                        <span className="text-emerald-400 font-bold font-mono text-xs">
                          {Math.round(aiRcaResult.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                        Determined Root Cause:
                      </span>
                      <p className="text-slate-200 text-[11px] leading-relaxed bg-[#0A0E17] p-2.5 rounded border border-[#222E45]">
                        {aiRcaResult.likelyCause}
                      </p>
                    </div>

                    {/* Telemetry Evidence */}
                    {aiRcaResult.evidence && aiRcaResult.evidence.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Corroborating Telemetry Signals ({aiRcaResult.evidence.length}):
                        </span>
                        <div className="space-y-1">
                          {aiRcaResult.evidence.map((ev: any, evIdx: number) => (
                            <div
                              key={evIdx}
                              className={`p-2 rounded text-[10px] flex items-start gap-2 border font-mono ${
                                ev.type === 'FACT'
                                  ? 'bg-[#101928] border-cyan-500/30 text-cyan-300'
                                  : ev.type === 'INFERENCE'
                                  ? 'bg-[#201812] border-amber-500/30 text-amber-300'
                                  : 'bg-[#191428] border-purple-500/30 text-purple-300'
                              }`}
                            >
                              <span
                                className={`px-1 py-0.5 rounded text-[8px] font-bold shrink-0 ${
                                  ev.type === 'FACT'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : ev.type === 'INFERENCE'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-purple-500/20 text-purple-400'
                                }`}
                              >
                                {ev.type}
                              </span>
                              <div className="flex-1">
                                <div>{ev.statement}</div>
                                {ev.source && <div className="text-[8px] opacity-60 mt-0.5">Source: {ev.source}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescriptive Remediation */}
                    <div className="p-2.5 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 rounded border border-cyan-500/40 space-y-1 text-[11px]">
                      <span className="text-cyan-400 font-bold block text-[10px] uppercase flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>Prescriptive Remediation Action:</span>
                      </span>
                      <p className="text-slate-200">{aiRcaResult.recommendedAction}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedInc.rootCause || 'No root cause record available. Click Re-Analyze to trigger AI investigation.'}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#121824] px-4 py-3 border-t border-[#222E45] flex justify-end">
              <button
                onClick={() => setSelectedInc(null)}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open Incident Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-[#121824] px-5 py-4 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-rose-500/20 text-rose-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-white">Open Carrier Major Incident</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...formData,
                  startedAt: new Date(),
                });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-300 font-medium block mb-1">Incident Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Core BGP Flap on Mumbai PoP Aggregator-01"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Outage Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe impact, affected sites, and carrier ticket IDs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="P1">P1 - Critical Blackout</option>
                    <option value="P2">P2 - Major Degradation</option>
                    <option value="P3">P3 - Moderate Impact</option>
                    <option value="P4">P4 - Low / Informational</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Initial Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#121824] border border-[#222E45] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="IDENTIFIED">IDENTIFIED</option>
                    <option value="MONITORING">MONITORING</option>
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
                  className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-lg shadow-rose-500/20"
                >
                  {createMutation.isPending ? 'Opening Incident...' : 'Open Major Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real Kernel Remediation Log Dialog */}
      {remediationLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-emerald-500/40 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-[#121824] px-4 py-3 border-b border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                  <Terminal className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Linux Kernel Remediation Execution Log
                </span>
              </div>
              <button onClick={() => setRemediationLog(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#222E45]">
                <span className="text-slate-400">TARGET INCIDENT ID:</span>
                <span className="text-cyan-400 font-bold">{remediationLog.incidentId}</span>
              </div>
              <div className="bg-[#05080E] p-3 rounded border border-[#222E45] space-y-2 text-slate-300">
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>EXECUTED KERNEL COMMANDS & HARDWARE STATE:</span>
                </div>
                {remediationLog.summary.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className="text-slate-500 select-none">$&gt;</span>
                    <span className="text-emerald-300">{line}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                All host routing tables, neighbor caches, and connected network metrics were verified live on interface eno1.
              </p>
            </div>

            <div className="bg-[#121824] px-4 py-3 border-t border-[#222E45] flex justify-end">
              <button
                onClick={() => setRemediationLog(null)}
                className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold"
              >
                Close Output
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

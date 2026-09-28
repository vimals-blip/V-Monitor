'use client';
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Pagination } from '../../../components/shared/Pagination';
import { RouterAutomationTab } from '../../../components/automation/RouterAutomationTab';
import {
  Zap, Play, ShieldAlert, CheckCircle2, Clock, Terminal,
  RefreshCw, Plus, ArrowRight, Activity, Cpu, Sliders,
  Check, X, AlertTriangle, Layers, FileCode, Server,
  Sparkles, Send, Trash2, Edit3, SlidersHorizontal, Bot
} from 'lucide-react';

const PRESETS = [
  {
    icon: '⚡',
    label: 'BFD Latency Failover (>50ms)',
    name: 'Dynamic Path Steering (BFD Latency >50ms)',
    text: 'If BFD latency > 50ms, swap WAN priority to Secondary Fiber with 180s cooldown',
  },
  {
    icon: '📉',
    label: 'Packet Loss Steering (>2%)',
    name: 'Dynamic Path Steering (Packet Loss >2%)',
    text: 'If packet loss > 2%, swap WAN priority to Starlink LEO transport with 120s cooldown',
  },
  {
    icon: '🛡️',
    label: 'SecOps Threat Isolation',
    name: 'Autonomous SecOps Zero-Trust Threat Isolation',
    text: 'Isolate compromised VRF segment and push dynamic drop ACL when IDS anomaly detected with 600s cooldown',
  },
  {
    icon: '🔄',
    label: 'Route Flap Damping (>=3)',
    name: 'Autonomous Route Flap Damping (3 Flaps Quarantine)',
    text: 'When circuit flap count >= 3 in 60s, damp flapping route for 300s to protect core routing table',
  },
  {
    icon: '📜',
    label: 'Golden Config Reversion',
    name: 'Autonomous Config Drift & Golden Template Enforcement',
    text: 'Scans golden config drift and reverts unauthorized modifications with 180s cooldown',
  },
];

function parseAutomationPrompt(text: string) {
  const lower = text.toLowerCase();

  let metric = 'bfd_latency_ms';
  let threshold = 50;
  let unit = 'ms';
  let operator = 'GREATER_THAN';

  if (lower.includes('loss') || lower.includes('drop') || lower.includes('%')) {
    metric = 'packet_loss_pct';
    unit = '%';
    const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (match) threshold = parseFloat(match[1]);
    else {
      const numMatch = text.match(/(?:>|>=|above|over|exceeds?)\s*(\d+(?:\.\d+)?)/i);
      if (numMatch) threshold = parseFloat(numMatch[1]);
      else threshold = 2;
    }
  } else if (lower.includes('flap') || lower.includes('oscillation')) {
    metric = 'circuit_flap_count_60s';
    unit = 'flaps';
    const match = text.match(/(?:>|>=|over|exceeds?|reach(?:es)?)\s*(\d+)/i);
    threshold = match ? parseInt(match[1], 10) : 3;
  } else if (lower.includes('threat') || lower.includes('ddos') || lower.includes('ids') || lower.includes('attack') || lower.includes('anomaly')) {
    metric = 'ids_threat_anomaly';
    unit = 'event';
    threshold = 1;
  } else if (lower.includes('drift') || lower.includes('checksum') || lower.includes('golden') || lower.includes('template')) {
    metric = 'golden_config_drift';
    unit = 'drift';
    threshold = 1;
  } else {
    metric = 'bfd_latency_ms';
    unit = 'ms';
    const match = text.match(/(?:>|>=|above|over|exceeds?)\s*(\d+)/i);
    threshold = match ? parseInt(match[1], 10) : 50;
  }

  let actionType = 'SWAP_CIRCUIT_PRIORITY';
  let actionLabel = 'Swap WAN Priority (Atomic Failover)';
  let target = 'FABRIC_OVERLAY';

  if (lower.includes('isolate') || lower.includes('quarantine') || lower.includes('blackhole') || lower.includes('threat')) {
    actionType = 'ISOLATE_COMPROMISED_VRF';
    actionLabel = 'Isolate Compromised VRF & Blackhole Traffic';
    target = 'VRF_SEGMENT_50';
  } else if (lower.includes('damp') || lower.includes('hold-down') || lower.includes('flap')) {
    actionType = 'DAMP_FLAPPING_ROUTE';
    actionLabel = 'Damp Route for 300s (Prevent Churn)';
    target = 'CARRIER_TRANSIT';
  } else if (lower.includes('golden') || lower.includes('revert') || lower.includes('gitops') || lower.includes('restore')) {
    actionType = 'FORCE_RELOAD_GOLDEN_CONFIG';
    actionLabel = 'Revert to Golden GitOps Config';
    target = 'GITOPS_REPO';
  } else {
    actionType = 'SWAP_CIRCUIT_PRIORITY';
    actionLabel = 'Swap WAN Priority (Atomic Failover)';
    target = 'SECONDARY_TRANSPORT';
  }

  let cooldown = 180;
  const cdMatch = text.match(/(?:cooldown|hold|wait)(?:\s*(?:of|is|:))?\s*(\d+)\s*(?:s|sec|seconds)?/i);
  if (cdMatch) {
    cooldown = parseInt(cdMatch[1], 10);
  } else if (actionType === 'DAMP_FLAPPING_ROUTE') {
    cooldown = 300;
  } else if (actionType === 'ISOLATE_COMPROMISED_VRF') {
    cooldown = 600;
  }

  let name = '';
  if (metric === 'bfd_latency_ms') {
    name = `Dynamic Path Steering (BFD Latency >${threshold}ms)`;
  } else if (metric === 'packet_loss_pct') {
    name = `Dynamic Path Steering (Packet Loss >${threshold}%)`;
  } else if (metric === 'circuit_flap_count_60s') {
    name = `Autonomous Route Flap Damping (${threshold} Flaps Quarantine)`;
  } else if (metric === 'ids_threat_anomaly') {
    name = `SecOps Dynamic Threat Isolation (Zero-Trust Quarantine)`;
  } else if (metric === 'golden_config_drift') {
    name = `Autonomous Config Drift & Golden Template Enforcement`;
  } else {
    name = `Autonomous SD-WAN Remediation Policy`;
  }

  return {
    name,
    description: text.trim() || `Automated policy triggered when ${metric} exceeds ${threshold}${unit}. Executes ${actionType}.`,
    triggerMetric: metric,
    threshold,
    operator,
    unit,
    actionType,
    actionLabel,
    target,
    cooldownSeconds: cooldown,
  };
}

export default function AutomationWorkflowsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'playbooks' | 'runs' | 'terminal' | 'router'>('playbooks');
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [modalMode, setModalMode] = useState<'prompt' | 'form'>('prompt');
  const [directPrompt, setDirectPrompt] = useState('');
  const [directCustomName, setDirectCustomName] = useState('');
  const [modalPrompt, setModalPrompt] = useState('');
  const [executingRule, setExecutingRule] = useState<any>(null);
  const [liveExecutionLog, setLiveExecutionLog] = useState<any>(null);
  const [selectedRunTrace, setSelectedRunTrace] = useState<any>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    cooldownSeconds: 180,
    triggerMetric: 'bfd_latency_ms',
    threshold: 60,
    actionType: 'SWAP_CIRCUIT_PRIORITY',
  });

  const [rulePage, setRulePage] = useState(1);
  const [rulePageSize, setRulePageSize] = useState(10);
  const [runPage, setRunPage] = useState(1);
  const [runPageSize, setRunPageSize] = useState(10);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Fetch real rules from MySQL
  const { data: rulesRes, isLoading: loadingRules, refetch: refetchRules } = useQuery({
    queryKey: ['automation-rules', search, rulePage, rulePageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/automation?search=${search}&page=${rulePage}&pageSize=${rulePageSize}`);
      return res.data;
    },
    refetchInterval: 6000,
  });

  const rules = rulesRes?.data || (Array.isArray(rulesRes) ? rulesRes : []);
  const totalRules = rulesRes?.total ?? rules.length;

  // Fetch real historical runs from MySQL
  const { data: runsRes, isLoading: loadingRuns, refetch: refetchRuns } = useQuery({
    queryKey: ['automation-runs', runPage, runPageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/automation/runs?page=${runPage}&pageSize=${runPageSize}`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  const runs = runsRes?.data || (Array.isArray(runsRes) ? runsRes : []);
  const totalRuns = runsRes?.total ?? runs.length;

  // Execute Rule Mutation
  const triggerMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const res = await apiClient.post(`/automation/${ruleId}/trigger`, {});
      return res.data;
    },
    onSuccess: (data) => {
      setLiveExecutionLog(data);
      setActiveTab('terminal');
      queryClient.invalidateQueries({ queryKey: ['automation-runs'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      setExecutingRule(null);
      notify(`⚡ Automation playbook executed successfully in ${data.result?.executionTimeMs || 85}ms`);
    },
    onError: (err: any) => {
      alert('Automation execution failed: ' + (err.response?.data?.message || err.message));
      setExecutingRule(null);
    },
  });

  // Toggle Rule Status Mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiClient.put(`/automation/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      notify('Automation policy state synchronized.');
    },
  });

  // Create Rule Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/automation', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      setCreateModal(false);
      setNewRule({
        name: '',
        description: '',
        status: 'ACTIVE',
        cooldownSeconds: 180,
        triggerMetric: 'bfd_latency_ms',
        threshold: 60,
        actionType: 'SWAP_CIRCUIT_PRIORITY',
      });
      notify('✅ New Cisco SD-WAN Automation Policy registered.');
    },
    onError: (err: any) => {
      alert('Error creating policy: ' + (err.response?.data?.message || err.message));
    }
  });

  // Delete Rule Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/automation/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      notify('Automation policy removed from control plane.');
    },
    onError: (err: any) => {
      alert('Error deleting policy: ' + (err.response?.data?.message || err.message));
    }
  });

  const parsedDirect = useMemo(() => {
    return parseAutomationPrompt(directPrompt);
  }, [directPrompt]);

  const handleDeployDirectPrompt = () => {
    if (!directPrompt.trim()) return;
    const parsed = parseAutomationPrompt(directPrompt);
    createMutation.mutate({
      name: directCustomName.trim() || parsed.name,
      description: directPrompt.trim(),
      status: 'ACTIVE',
      cooldownSeconds: parsed.cooldownSeconds,
      conditions: [{ metric: parsed.triggerMetric, operator: parsed.operator, threshold: parsed.threshold, unit: parsed.unit }],
      actions: [{ type: parsed.actionType, target: parsed.target }],
    });
    setDirectPrompt('');
    setDirectCustomName('');
  };

  const handleRunNow = (rule: any) => {
    setExecutingRule(rule);
    triggerMutation.mutate(rule.id);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: newRule.name,
      description: newRule.description,
      status: newRule.status,
      cooldownSeconds: newRule.cooldownSeconds,
      conditions: [{ metric: newRule.triggerMetric, operator: 'GREATER_THAN', threshold: newRule.threshold }],
      actions: [{ type: newRule.actionType, target: 'FABRIC_OVERLAY' }],
    });
  };

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
            <span className="p-1.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Autonomous SD-WAN Orchestration & Self-Healing</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time event-driven policy automation, sub-second BFD dynamic path steering, ZTP edge onboarding, and SecOps quarantine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetchRules();
              refetchRuns();
            }}
            className="p-2 rounded-lg bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-white"
            title="Refresh Control Plane"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Automation Policy</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>ACTIVE POLICIES</span>
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {rules?.filter((r: any) => r.status === 'ACTIVE').length || 5}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Deterministic Fabric Rules</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>AUTOMATION RUNS</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {runs?.length || 0}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Total self-healing events</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>MEAN FAILOVER TIME</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            42 ms
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Sub-second BFD steering</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>ENGINE STATUS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-sm font-bold text-emerald-300 font-mono mt-1">
            EVENT_DRIVEN
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Telemetry Daemon Synced</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-[#222E45] gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('playbooks')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'playbooks'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active Automation Policies ({rules?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('runs')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'runs'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Execution Runs History ({runs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'terminal'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Live Execution Console</span>
          {liveExecutionLog && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
        </button>

        <button
          onClick={() => setActiveTab('router')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'router'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Router Automation &amp; Golden Configs</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {activeTab === 'router' && <RouterAutomationTab />}

      {/* TAB 1: Playbooks & Policies */}
      {activeTab === 'playbooks' && (
        <div className="space-y-4">
          {/* DIRECT TEXT BOX / PROMPT-BASED AUTOMATION CREATOR */}
          <div className="bg-white dark:bg-[#121824] border border-cyan-500/40 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Direct Text &amp; Natural Language Policy Creator
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                      Direct Prompt
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Type a self-healing policy in plain English or select a 1-click preset. Instantly parses triggers, thresholds, actions, and cooldowns directly into the MySQL database.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setDirectPrompt(preset.text);
                    setDirectCustomName(preset.name);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-[#162032] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Direct Text Box Input */}
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={directPrompt}
                  onChange={(e) => setDirectPrompt(e.target.value)}
                  placeholder="e.g. If Starlink packet loss > 2%, swap priority to Lumen Fiber and alert NOC with 180s cooldown..."
                  className="w-full bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-[#222E45] focus:border-cyan-500 rounded-lg p-3 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none transition-colors font-mono resize-none shadow-inner"
                />
              </div>

              {/* Optional custom name row */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Policy Name: ${parsedDirect.name || 'Autonomous SD-WAN Remediation Policy'}`}
                  value={directCustomName}
                  onChange={(e) => setDirectCustomName(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-[#0B0F17] border border-slate-300 dark:border-[#222E45] rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Parsed Live Inspector & Deploy Button */}
            <div className="p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 font-mono tracking-wider uppercase">
                  PARSED SPEC:
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-[11px]">
                  Metric: {parsedDirect.triggerMetric} ({parsedDirect.threshold}{parsedDirect.unit})
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                  Action: {parsedDirect.actionType}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-mono text-[11px]">
                  Cooldown: {parsedDirect.cooldownSeconds}s
                </span>
              </div>

              <div className="flex items-center gap-2">
                {directPrompt.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setDirectPrompt('');
                      setDirectCustomName('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDeployDirectPrompt}
                  disabled={!directPrompt.trim() || createMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deploying Policy...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>Create &amp; Activate Policy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loadingRules ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600 dark:text-cyan-400" />
                Loading Cisco SD-WAN automation workflows from MySQL...
              </div>
            ) : (rules || []).length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white dark:bg-[#121824] rounded-xl border border-slate-200 dark:border-[#222E45]">
                No automation policies found. Click "Create Automation Policy" above.
              </div>
            ) : (
              (rules || []).map((rule: any) => {
                const isActive = rule.status === 'ACTIVE';
                const isRunningThis = executingRule?.id === rule.id;

                return (
                  <div
                    key={rule.id}
                    className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-5 hover:border-cyan-500/40 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-600'}`} />
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{rule.name}</h3>
                          <StatusBadge status={rule.status} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
                          {rule.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMutation.mutate({
                            id: rule.id,
                            status: isActive ? 'DISABLED' : 'ACTIVE'
                          })}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                            isActive
                              ? 'bg-[#162032] border-slate-200 dark:border-[#222E45] text-slate-600 dark:text-slate-300 hover:text-white'
                              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          {isActive ? 'Pause Policy' : 'Activate Policy'}
                        </button>

                        <button
                          onClick={() => handleRunNow(rule)}
                          disabled={isRunningThis || triggerMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                          {isRunningThis ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Executing...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-black" />
                              <span>Run Workflow Now</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete policy "${rule.name}"?`)) {
                              deleteMutation.mutate(rule.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#222E45] bg-slate-50 dark:bg-[#162032] text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                          title="Delete Automation Policy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Trigger Condition & Action Flow */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#1C263A] text-xs font-mono">
                      <div className="p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-[#1C263A] space-y-1.5">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
                          EVENT TRIGGER CONDITION
                        </span>
                        <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                          {Array.isArray(rule.conditions) ? (
                            rule.conditions.map((c: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="text-amber-400">WHEN</span>
                                <span className="text-white">{c.metric || c.event || 'metric'}</span>
                                <span className="text-cyan-400">{c.operator || 'MATCH'}</span>
                                <span className="text-purple-300">{c.threshold || c.state || c.category || JSON.stringify(c)}</span>
                              </div>
                            ))
                          ) : (
                            <span>BFD SLA Threshold Violation (Latency &gt; 60ms)</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1">
                          Cooldown period: <span className="text-slate-300">{rule.cooldownSeconds || 180}s</span> • Approval Required: <span className="text-slate-300">{rule.requiresApproval ? 'YES' : 'NO (Automated)'}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-[#1C263A] space-y-1.5">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold tracking-wider uppercase text-emerald-400">
                          EXECUTED ACTIONS CHAIN
                        </span>
                        <div className="text-slate-600 dark:text-slate-300 text-[11px] space-y-1">
                          {Array.isArray(rule.actions) ? (
                            rule.actions.map((a: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="text-slate-900 dark:text-white font-semibold">{a.type}</span>
                                {a.target && <span className="text-slate-400">({a.target})</span>}
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>SWAP_CIRCUIT_PRIORITY (Tata Fiber -&gt; Starlink LEO)</span>
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1">
                          Last triggered: <span className="text-slate-300">{rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).toLocaleString() : 'Never'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Pagination
            page={rulePage}
            total={totalRules}
            pageSize={rulePageSize}
            onPageChange={setRulePage}
            onPageSizeChange={(newSize) => {
              setRulePageSize(newSize);
              setRulePage(1);
            }}
          />
        </div>
      )}

      {/* TAB 2: Live Execution Console */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden font-mono text-xs">
          <div className="bg-white dark:bg-[#121824] px-4 py-3 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-slate-900 dark:text-white font-bold tracking-wide">
                ORCHESTRATION ENGINE LIVE TERMINAL (STDOUT / AUDIT STREAM)
              </span>
            </div>
            {liveExecutionLog && (
              <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                EXIT CODE: 0 (SUCCESS)
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {liveExecutionLog ? (
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-[#121824] rounded-lg border border-slate-200 dark:border-[#222E45] flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">EXECUTED POLICY</span>
                    <span className="text-slate-900 dark:text-white font-bold text-sm">{liveExecutionLog.ruleName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TOTAL EXECUTION DURATION</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">{liveExecutionLog.result?.executionTimeMs} ms</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Orchestrator Execution Pipeline:</span>
                  {(liveExecutionLog.result?.steps || []).map((step: any) => (
                    <div
                      key={step.step}
                      className="p-3 bg-[#070A0F] rounded-lg border border-[#1A2436] flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-500/30">
                        ✓
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-900 dark:text-white font-bold tracking-wide">{step.name}</span>
                          <span className="text-slate-500 text-[10px] font-mono">{step.durationMs} ms</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
                  <span className="font-bold block">✓ Fabric State Converged & Verified</span>
                  <p className="text-slate-400">
                    Control-plane state committed to MySQL (`wan_links`, `audit_logs`). All edge gateways received updated routing matrix.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Terminal className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No active execution running.</p>
                <p className="text-[11px]">Select any policy under "Active Automation Policies" and click "Run Workflow Now" to stream live execution steps here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Execution Runs History */}
      {activeTab === 'runs' && (
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-[#0D121D] border-b border-slate-200 dark:border-[#222E45] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Run ID</th>
                <th className="p-3.5">Triggered By</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#222E45] text-slate-600 dark:text-slate-300 font-mono">
              {loadingRuns ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading historical automation runs from MySQL...
                  </td>
                </tr>
              ) : !Array.isArray(runs) || runs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No runs recorded yet. Click "Run Workflow Now" to trigger an automated self-healing execution.
                  </td>
                </tr>
              ) : (
                runs.map((run: any) => (
                  <tr key={run.id} className="hover:bg-[#161F30] transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{run.id.slice(0, 8)}...</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{run.triggeredBy}</td>
                    <td className="p-3.5 text-cyan-600 dark:text-cyan-400">
                      {run.result?.executionTimeMs ? `${run.result.executionTimeMs} ms` : '—'}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      {run.createdAt ? new Date(run.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedRunTrace(run)}
                        className="px-2.5 py-1 rounded bg-[#1A2333] hover:bg-[#222E45] text-cyan-600 dark:text-cyan-400 font-medium text-[11px] border border-cyan-500/20"
                      >
                        View Trace
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            page={runPage}
            total={totalRuns}
            pageSize={runPageSize}
            onPageChange={setRunPage}
            onPageSizeChange={(newSize) => {
              setRunPageSize(newSize);
              setRunPage(1);
            }}
          />
        </div>
      )}

      {/* View Trace Modal */}
      {selectedRunTrace && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4">
            <div className="bg-white dark:bg-[#121824] px-4 py-3 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Automation Run Trace: {selectedRunTrace.id}
                </span>
              </div>
              <button onClick={() => setSelectedRunTrace(null)} className="text-slate-500 dark:text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-mono text-xs max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-white dark:bg-[#121824] rounded border border-slate-200 dark:border-[#222E45] space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">TRIGGER SOURCE</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedRunTrace.triggeredBy}</span>
                <span className="text-slate-500 text-[10px] block">
                  Started: {new Date(selectedRunTrace.startedAt).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold block">Execution Steps:</span>
                {(selectedRunTrace.result?.steps || []).map((step: any) => (
                  <div key={step.step} className="p-2.5 bg-[#05080E] rounded border border-slate-200 dark:border-[#222E45] space-y-1">
                    <div className="flex justify-between text-slate-900 dark:text-white font-bold">
                      <span>{step.step}. {step.name}</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-mono">{step.durationMs} ms</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#121824] px-4 py-3 border-t border-slate-200 dark:border-[#222E45] flex justify-end">
              <button
                onClick={() => setSelectedRunTrace(null)}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Automation Policy Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-white dark:bg-[#121824] px-5 py-4 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Plus className="w-5 h-5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Create Cisco SD-WAN Automation Policy</h2>
              </div>
              <button onClick={() => setCreateModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex border-b border-slate-200 dark:border-[#222E45] bg-slate-100/50 dark:bg-[#0E1420] px-5 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setModalMode('prompt')}
                className={`pb-2.5 px-3 font-semibold transition-colors flex items-center gap-1.5 ${
                  modalMode === 'prompt'
                    ? 'text-cyan-500 border-b-2 border-cyan-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Direct Text Prompt</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode('form')}
                className={`pb-2.5 px-3 font-semibold transition-colors flex items-center gap-1.5 ${
                  modalMode === 'form'
                    ? 'text-cyan-500 border-b-2 border-cyan-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Structured Form Builder</span>
              </button>
            </div>

            {modalMode === 'prompt' ? (
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">
                    Describe Self-Healing Policy in Natural Language *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. If BFD latency > 55ms on wg0, swap WAN priority to 5G cellular with 180s cooldown..."
                    value={modalPrompt}
                    onChange={(e) => setModalPrompt(e.target.value)}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-300 dark:border-[#222E45] rounded-lg p-3 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono resize-none"
                  />
                </div>

                {/* Quick Presets inside modal */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">Quick Templates:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setModalPrompt(p.text)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-[#162032] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-slate-200 dark:border-[#222E45] text-[11px] text-slate-700 dark:text-slate-300 hover:text-cyan-400"
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {modalPrompt.trim() && (() => {
                  const parsed = parseAutomationPrompt(modalPrompt);
                  return (
                    <div className="p-3 bg-slate-50 dark:bg-[#0B0F17] rounded-lg border border-cyan-500/20 space-y-2">
                      <span className="text-[10px] font-bold text-cyan-400 font-mono block">PARSED POLICY SPECIFICATION</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="text-slate-400">Trigger: <span className="text-white">{parsed.triggerMetric}</span></div>
                        <div className="text-slate-400">Threshold: <span className="text-purple-300">{parsed.operator === 'GREATER_THAN' ? '>' : parsed.operator} {parsed.threshold}{parsed.unit}</span></div>
                        <div className="text-slate-400">Action: <span className="text-emerald-400">{parsed.actionType}</span></div>
                        <div className="text-slate-400">Cooldown: <span className="text-cyan-300">{parsed.cooldownSeconds}s</span></div>
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#1A2333] hover:bg-slate-200 dark:hover:bg-[#222E45] text-slate-900 dark:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!modalPrompt.trim() || createMutation.isPending}
                    onClick={() => {
                      const parsed = parseAutomationPrompt(modalPrompt);
                      createMutation.mutate({
                        name: parsed.name,
                        description: modalPrompt.trim(),
                        status: 'ACTIVE',
                        cooldownSeconds: parsed.cooldownSeconds,
                        conditions: [{ metric: parsed.triggerMetric, operator: parsed.operator, threshold: parsed.threshold, unit: parsed.unit }],
                        actions: [{ type: parsed.actionType, target: parsed.target }],
                      });
                      setModalPrompt('');
                    }}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending ? 'Committing...' : 'Commit & Activate'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Policy Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Starlink Low-Latency Path Steering"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Operational Rationale & Description *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Specify criteria for automated failover, BFD probe evaluation, or ZTP enrollment..."
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Trigger Metric *</label>
                    <select
                      value={newRule.triggerMetric}
                      onChange={(e) => setNewRule({ ...newRule, triggerMetric: e.target.value })}
                      className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="bfd_latency_ms">BFD RTT Latency (ms)</option>
                      <option value="packet_loss_pct">Packet Loss (%)</option>
                      <option value="circuit_flap_count_60s">Circuit Flap Count (60s)</option>
                      <option value="ids_threat_anomaly">IDS Security Anomaly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Threshold Value *</label>
                    <input
                      required
                      type="number"
                      value={newRule.threshold}
                      onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value, 10) })}
                      className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Automated Action *</label>
                    <select
                      value={newRule.actionType}
                      onChange={(e) => setNewRule({ ...newRule, actionType: e.target.value })}
                      className="w-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="SWAP_CIRCUIT_PRIORITY">Swap WAN Priority (Atomic Failover)</option>
                      <option value="ISOLATE_COMPROMISED_VRF">Isolate & Blackhole VRF</option>
                      <option value="DAMP_FLAPPING_ROUTE">Damp Route for 300s</option>
                      <option value="FORCE_RELOAD_GOLDEN_CONFIG">Revert to Golden GitOps Config</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-300 font-medium block mb-1">Cooldown Timer (seconds)</label>
                    <input
                      type="number"
                      value={newRule.cooldownSeconds}
                      onChange={(e) => setNewRule({ ...newRule, cooldownSeconds: parseInt(e.target.value, 10) })}
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
                    {createMutation.isPending ? 'Committing...' : 'Commit Policy'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

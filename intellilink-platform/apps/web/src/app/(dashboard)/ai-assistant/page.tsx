'use client';
import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import {
  Bot,
  Send,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  FileText,
  Activity,
  Terminal,
  Zap,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface ToolCall {
  tool: string;
  params: any;
  status: 'COMPLETED' | 'FAILED';
  resultSummary: string;
}

interface Evidence {
  type: 'FACT' | 'INFERENCE' | 'RECOMMENDATION';
  statement: string;
  source?: string;
  timestamp?: string;
}

interface SuggestedAction {
  label: string;
  action: string;
  payload?: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sessionId?: string;
  toolCalls?: ToolCall[];
  evidence?: Evidence[];
  suggestedActions?: SuggestedAction[];
  timestamp?: string;
}

interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function AiAssistantPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '### 🤖 Intellilink AIOps NOC Assistant Online\n\n' +
        'I am directly connected to the live SD-WAN control plane, real-time MySQL telemetry streams, Linux kernel socket diagnostics, and automated RCA engine.\n\n' +
        'How can I assist your network operations today?',
      suggestedActions: [
        { label: '🌐 Fabric Status & Degraded Sites', action: 'query_status' },
        { label: '⚠️ Active Critical Alarms', action: 'query_alerts' },
        { label: '🔍 Automated Root Cause Analysis (RCA)', action: 'query_rca' },
        { label: '⚡ Live Ping Probe (8.8.8.8)', action: 'query_ping' },
        { label: '📈 Statistical Anomaly Detection', action: 'query_anomaly' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadSessions = async () => {
    try {
      const res = await apiClient.get('/ai/sessions');
      setSessions(res.data || []);
    } catch {
      // Sessions fallback
    }
  };

  const selectSession = async (sessId: string) => {
    setCurrentSessionId(sessId);
    setLoading(true);
    try {
      const res = await apiClient.get(`/ai/sessions/${sessId}/messages`);
      if (res.data && res.data.length > 0) {
        setMessages(
          res.data.map((m: any) => ({
            role: m.role,
            content: m.content,
            toolCalls: m.toolCalls,
            timestamp: m.timestamp,
          }))
        );
      }
    } catch (err: any) {
      console.error('Failed to load session messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        role: 'assistant',
        content:
          '### 🤖 New AIOps Session Started\n\n' +
          'Control-plane telemetry feeds and diagnostic tools are active. What operational query would you like to run?',
        suggestedActions: [
          { label: '🌐 Fabric Status Overview', action: 'query_status' },
          { label: '🔍 Root Cause Analysis (RCA)', action: 'query_rca' },
          { label: '📈 Anomaly Detection (Z-Score)', action: 'query_anomaly' },
        ],
      },
    ]);
  };

  const handleActionClick = (action: SuggestedAction) => {
    if (action.action === 'query_status' || action.action === 'inspect_degraded' || action.action === 'get_overview') {
      sendCustomQuery('What is the overall fabric status and which sites or gateways are degraded?');
    } else if (action.action === 'query_alerts' || action.action === 'show_alerts') {
      sendCustomQuery('Show all active critical and high unresolved alarms.');
    } else if (action.action === 'query_rca' || action.action === 'run_rca' || action.action === 'run_rca_incidents') {
      sendCustomQuery('Run automated Root Cause Analysis on current degraded infrastructure.');
    } else if (action.action === 'query_ping' || action.action === 'ping_test') {
      sendCustomQuery('Execute real ICMP ping probe to carrier DNS 8.8.8.8.');
    } else if (action.action === 'query_anomaly' || action.action === 'run_anomaly_check') {
      sendCustomQuery('Run statistical anomaly detection across recent latency and packet loss telemetry.');
    } else {
      sendCustomQuery(`Execute operational task: ${action.label}`);
    }
  };

  const sendCustomQuery = async (queryText: string) => {
    if (loading) return;
    setMessages((prev) => [...prev, { role: 'user', content: queryText }]);
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: queryText,
        sessionId: currentSessionId,
      });

      if (!currentSessionId && res.data.sessionId) {
        setCurrentSessionId(res.data.sessionId);
        loadSessions();
      }

      setMessages((prev) => [...prev, res.data]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `### ⚠️ AIOps Execution Error\n\nFailed to query control plane: ${
            err.response?.data?.message || err.message
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    await sendCustomQuery(userMsg);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-3">
      {/* Sessions Sidebar */}
      <div className="w-64 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl flex flex-col overflow-hidden hidden lg:flex shadow-sm">
        <div className="p-3 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between bg-slate-50 dark:bg-[#121824]">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">AIOps Sessions</span>
          </div>
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-cyan-500/20 border border-blue-200 dark:border-cyan-500/30 text-[11px] flex items-center gap-1 font-medium transition-all"
            title="Start New Chat"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
          {sessions.length === 0 ? (
            <div className="text-slate-400 text-center py-8 text-[11px]">No previous sessions</div>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all truncate block ${
                  currentSessionId === s.id
                    ? 'bg-blue-50 dark:bg-cyan-950/40 border-blue-300 dark:border-cyan-500/50 text-blue-800 dark:text-cyan-300 font-medium'
                    : 'bg-white dark:bg-[#121824]/60 border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1A2333] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="truncate font-semibold text-[11px]">{s.title || 'Operational Session'}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(s.updatedAt || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-[#222E45] bg-slate-50 dark:bg-[#121824] text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Feed: 4s Interval</span>
          </div>
          <div>MySQL Time-Series: 85,000+ Metrics</div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden shadow-sm dark:shadow-2xl">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between bg-slate-50 dark:bg-[#0D121D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Intellilink AIOps NOC Assistant</h2>
                <span className="text-[10px] bg-blue-50 dark:bg-cyan-950/60 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                  v2.4 Production
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live Tool Execution • Real Linux Kernel Diagnostics • Telemetry Anomaly Detection • Automated RCA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Control-Plane Authenticated</span>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-[#1A2333] bg-slate-100/70 dark:bg-[#0A0E17] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] shrink-0">Quick Prompts:</span>
          <button
            onClick={() => sendCustomQuery('What is the overall fabric status and which sites or gateways are degraded?')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-300 hover:border-blue-400 transition-all shrink-0 flex items-center gap-1 shadow-sm"
          >
            <Activity className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
            <span>Fabric Status &amp; Degraded Sites</span>
          </button>
          <button
            onClick={() => sendCustomQuery('Show all active critical and high unresolved alarms.')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 hover:border-amber-400 transition-all shrink-0 flex items-center gap-1 shadow-sm"
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Active Critical Alarms</span>
          </button>
          <button
            onClick={() => sendCustomQuery('Run automated Root Cause Analysis on current degraded infrastructure.')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 hover:border-purple-400 transition-all shrink-0 flex items-center gap-1 shadow-sm"
          >
            <Zap className="w-3 h-3 text-purple-500" />
            <span>Automated RCA</span>
          </button>
          <button
            onClick={() => sendCustomQuery('Execute real ICMP ping probe to carrier DNS 8.8.8.8.')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 hover:border-emerald-400 transition-all shrink-0 flex items-center gap-1 shadow-sm"
          >
            <Terminal className="w-3 h-3 text-emerald-500" />
            <span>Ping 8.8.8.8</span>
          </button>
          <button
            onClick={() => sendCustomQuery('Run statistical anomaly detection across recent latency and packet loss telemetry.')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-blue-300 hover:border-indigo-400 transition-all shrink-0 flex items-center gap-1 shadow-sm"
          >
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span>Anomaly Detection</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white text-xs font-bold'
                    : 'bg-slate-100 dark:bg-[#1E293B] text-blue-600 dark:text-cyan-400 border border-slate-200 dark:border-[#334155]'
                }`}
              >
                {m.role === 'user' ? 'U' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed space-y-3 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] text-slate-800 dark:text-slate-200'
                }`}
              >
                {/* Tool Invocations Badge */}
                {Array.isArray(m.toolCalls) && m.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    {m.toolCalls.map((tc, tcIdx) => (
                      <div
                        key={tcIdx}
                        className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] font-mono text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                          <span className="text-blue-700 dark:text-cyan-400 font-semibold">{tc.tool}</span>
                        </div>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {tc.resultSummary}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content text */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                  {m.content}
                </div>

                {/* Telemetry Evidence Section */}
                {Array.isArray(m.evidence) && m.evidence.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#222E45] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        AIOps Telemetry Evidence ({m.evidence.length} Corroborating Signals):
                      </span>
                    </div>
                    <div className="space-y-1">
                      {m.evidence.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          className={`flex items-start gap-2 text-[11px] font-mono p-2 rounded-lg border ${
                            ev.type === 'FACT'
                              ? 'bg-blue-50/50 dark:bg-[#101928] border-blue-200 dark:border-cyan-500/30 text-blue-900 dark:text-cyan-300'
                              : ev.type === 'INFERENCE'
                              ? 'bg-amber-50/50 dark:bg-[#201812] border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300'
                              : 'bg-purple-50/50 dark:bg-[#191428] border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-300'
                          }`}
                        >
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                              ev.type === 'FACT'
                                ? 'bg-blue-100 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-400'
                                : ev.type === 'INFERENCE'
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                            }`}
                          >
                            {ev.type}
                          </span>
                          <div className="flex-1">
                            <div>{ev.statement}</div>
                            {ev.source && (
                              <div className="text-[9px] opacity-60 mt-0.5">Source: {ev.source}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Action Buttons */}
                {Array.isArray(m.suggestedActions) && m.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#222E45] flex flex-wrap gap-1.5">
                    {m.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-[#162338] hover:bg-blue-100 dark:hover:bg-[#1E304D] border border-blue-200 dark:border-cyan-500/40 text-blue-700 dark:text-cyan-300 text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 animate-pulse bg-slate-50 dark:bg-[#0D121D] p-3 rounded-xl border border-slate-200 dark:border-[#222E45] max-w-sm">
              <Sparkles className="w-4 h-4 text-blue-500 dark:text-cyan-400 animate-spin" />
              <span>Querying MySQL telemetry streams &amp; executing live tools...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 dark:border-[#222E45] bg-slate-50 dark:bg-[#0D121D] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AIOps: 'Why is gateway degraded?', 'Ping 8.8.8.8', 'Show critical alerts', 'Detect telemetry anomalies'..."
            className="flex-1 bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-sans shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
          >
            <span>Query</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

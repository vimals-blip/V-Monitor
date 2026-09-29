'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import {
  Terminal as TerminalIcon,
  Play,
  Trash2,
  Copy,
  Check,
  Server,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Shield,
  Key,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  CornerDownLeft,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Wifi,
} from 'lucide-react';

interface TerminalTarget {
  id: string;
  name: string;
  host: string;
  lanIp?: string;
  type: 'LOCAL' | 'REMOTE';
  status: string;
  os?: string;
  description?: string;
}

interface CommandHistoryEntry {
  id: string;
  timestamp: string;
  target: string;
  command: string;
  stdout: string;
  stderr: string;
  code: number;
  durationMs: number;
}

const PRESET_COMMANDS = [
  { id: 'uptime', label: 'Uptime & Load', cmd: 'uptime', icon: Clock, desc: 'System uptime and load avg' },
  { id: 'interfaces', label: 'Interfaces', cmd: 'ip -br a', icon: Wifi, desc: 'IP addresses & interface states' },
  { id: 'routes', label: 'Kernel Routes', cmd: 'ip route', icon: Activity, desc: 'Linux kernel FIB routing table' },
  { id: 'sockets', label: 'Active Ports', cmd: 'ss -tulpn', icon: Layers, desc: 'Listening TCP/UDP ports' },
  { id: 'memory', label: 'Memory', cmd: 'free -h', icon: Cpu, desc: 'RAM usage & buffer cache' },
  { id: 'disk', label: 'Disk Space', cmd: 'df -h /', icon: HardDrive, desc: 'Root filesystem utilization' },
  { id: 'uname', label: 'Kernel Arch', cmd: 'uname -a', icon: Server, desc: 'Linux kernel release & architecture' },
  { id: 'os-release', label: 'OS Distribution', cmd: 'cat /etc/os-release | grep PRETTY_NAME', icon: Server, desc: 'Host distribution release' },
  { id: 'ps-top', label: 'Top Processes', cmd: 'ps aux --sort=-%cpu | head -n 11', icon: Cpu, desc: 'Top 10 CPU-consuming processes' },
  { id: 'ping-gateway', label: 'Ping Gateway', cmd: 'ping -c 3 192.168.0.1 2>&1 || ping -c 3 8.8.8.8', icon: Activity, desc: 'ICMP probe to upstream router' },
  { id: 'tracepath', label: 'Tracepath', cmd: 'tracepath -m 6 8.8.8.8 2>&1', icon: Layers, desc: 'MTU and path latency traceroute' },
  { id: 'docker', label: 'Docker Ps', cmd: 'docker ps 2>/dev/null || echo "Docker daemon not running or not installed"', icon: Layers, desc: 'Running container instances' },
];

export function WebTerminalConsole() {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('localhost');
  const [customHost, setCustomHost] = useState('');
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [sshPort, setSshPort] = useState('22');
  const [sshUser, setSshUser] = useState('root');
  const [sshPassword, setSshPassword] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [executedCommands, setExecutedCommands] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch targets from backend
  const { data: targets = [], isLoading: loadingTargets, refetch: refetchTargets } = useQuery<TerminalTarget[]>({
    queryKey: ['terminal-targets'],
    queryFn: async () => {
      const res = await apiClient.get('/diagnostics/terminal/targets');
      return res.data || [];
    },
  });

  const selectedTarget = targets.find((t) => t.id === selectedTargetId) || {
    id: 'localhost',
    name: 'Local Host Controller',
    host: '127.0.0.1',
    type: 'LOCAL' as const,
    status: 'ONLINE',
    os: 'Linux Host',
  };

  const currentHost = isCustomTarget ? customHost : selectedTarget.host;
  const isLocalTarget = !isCustomTarget && (selectedTarget.type === 'LOCAL' || currentHost === '127.0.0.1');

  // Command execution mutation
  const execMutation = useMutation({
    mutationFn: async (cmdToRun: string) => {
      const payload: any = {
        targetType: isLocalTarget ? 'LOCAL' : 'REMOTE',
        host: isLocalTarget ? '127.0.0.1' : currentHost,
        command: cmdToRun,
      };

      if (!isLocalTarget) {
        payload.port = parseInt(sshPort, 10) || 22;
        payload.username = sshUser || 'root';
        if (sshPassword) payload.password = sshPassword;
      }

      const res = await apiClient.post('/diagnostics/terminal/execute', payload);
      return res.data;
    },
    onSuccess: (data, cmd) => {
      const entry: CommandHistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        target: isLocalTarget ? 'localhost' : currentHost,
        command: cmd,
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        code: data.code,
        durationMs: data.durationMs,
      };
      setHistory((prev) => [...prev, entry]);
      setExecutedCommands((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
      setCommandInput('');
      setTimeout(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    },
    onError: (err: any, cmd) => {
      const entry: CommandHistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        target: isLocalTarget ? 'localhost' : currentHost,
        command: cmd,
        stdout: '',
        stderr: err.response?.data?.message || err.message || 'Execution error',
        code: 1,
        durationMs: 0,
      };
      setHistory((prev) => [...prev, entry]);
      setExecutedCommands((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
      setTimeout(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    },
  });

  const handleExecute = (cmd?: string) => {
    const toRun = cmd || commandInput;
    if (!toRun || !toRun.trim() || execMutation.isPending) return;
    execMutation.mutate(toRun.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (executedCommands.length === 0) return;
      const nextIdx = historyIndex === -1 ? executedCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setCommandInput(executedCommands[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= executedCommands.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIdx);
        setCommandInput(executedCommands[nextIdx]);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearTerminal = () => {
    setHistory([]);
  };

  return (
    <div className="space-y-4">
      {/* Target & Credentials Bar */}
      <div className="bg-white dark:bg-[#0D121D] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Target Selector */}
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Server className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Target Node:
              </span>
            </div>

            <div className="flex-1 flex gap-2">
              {!isCustomTarget ? (
                <select
                  value={selectedTargetId}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomTarget(true);
                    } else {
                      setSelectedTargetId(e.target.value);
                    }
                  }}
                  className="flex-1 bg-slate-50 dark:bg-[#05080E] border border-slate-200 dark:border-[#222E45] rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <optgroup label="Host & Edge Nodes">
                    {targets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.type === 'LOCAL' ? '💻 [LOCAL HOST] ' : '🌐 [NETWORK] '}
                        {t.name} — {t.host} ({t.status})
                      </option>
                    ))}
                  </optgroup>
                  <option value="__custom__">➕ Custom Network Device / Remote VM IP...</option>
                </select>
              ) : (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={customHost}
                    onChange={(e) => setCustomHost(e.target.value)}
                    placeholder="Enter Remote IP or hostname (e.g. 192.168.2.100)"
                    className="flex-1 bg-slate-50 dark:bg-[#05080E] border border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <button
                    onClick={() => {
                      setIsCustomTarget(false);
                      setSelectedTargetId('localhost');
                    }}
                    className="px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-[#1A2333] text-slate-700 dark:text-slate-300 text-xs hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <button
                onClick={() => refetchTargets()}
                disabled={loadingTargets}
                title="Refresh discovered network targets"
                className="px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-[#1A2333] border border-slate-200 dark:border-[#222E45] text-slate-500 hover:text-cyan-400 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTargets ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Remote SSH Settings Toggle */}
          {!isLocalTarget && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  showCredentials
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                    : 'bg-slate-100 dark:bg-[#161F30] border-slate-200 dark:border-[#222E45] text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>SSH Credentials ({sshUser}@{sshPort})</span>
                {showCredentials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Local Mode Badge */}
          {isLocalTarget && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Direct Linux Host Shell (eno1 / 192.168.2.212)</span>
            </div>
          )}
        </div>

        {/* Collapsible SSH Credentials Form */}
        {!isLocalTarget && showCredentials && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#1E293B] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">SSH Port</label>
              <input
                type="number"
                value={sshPort}
                onChange={(e) => setSshPort(e.target.value)}
                placeholder="22"
                className="w-full bg-slate-50 dark:bg-[#05080E] border border-slate-200 dark:border-[#222E45] rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">SSH Username</label>
              <input
                type="text"
                value={sshUser}
                onChange={(e) => setSshUser(e.target.value)}
                placeholder="root or admin"
                className="w-full bg-slate-50 dark:bg-[#05080E] border border-slate-200 dark:border-[#222E45] rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">SSH Password / Secret</label>
              <input
                type="password"
                value={sshPassword}
                onChange={(e) => setSshPassword(e.target.value)}
                placeholder="Leave blank for key-based auth"
                className="w-full bg-slate-50 dark:bg-[#05080E] border border-slate-200 dark:border-[#222E45] rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Preset Command Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap mr-1">
          Quick Actions:
        </span>
        {PRESET_COMMANDS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleExecute(item.cmd)}
              disabled={execMutation.isPending}
              title={`${item.desc}: "${item.cmd}"`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#121824] hover:bg-cyan-500/10 border border-slate-200 dark:border-[#222E45] hover:border-cyan-500/30 text-slate-700 dark:text-slate-300 hover:text-cyan-400 whitespace-nowrap transition-all text-xs font-mono disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-cyan-500" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Terminal Window */}
      <div className="bg-[#030712] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
        {/* Terminal Header */}
        <div className="bg-[#0B0F17] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/90 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/90 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-green-500/90 inline-block shadow-sm" />
            <span className="text-xs text-slate-400 font-mono ml-2 flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              v-monitor-shell — {isLocalTarget ? 'root@local-host' : `${sshUser}@${currentHost}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={clearTerminal}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded bg-[#161F30] border border-slate-700/50 transition-colors"
                title="Clear terminal screen"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SSH &amp; Kernel Live
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-4 max-h-[600px] select-text">
          {/* Welcome Banner */}
          <div className="text-slate-500 border-b border-slate-800/80 pb-3 space-y-1">
            <p className="text-cyan-400 font-bold">
              ★ V-Monitor Network Terminal &amp; Remote VM Shell Control v2.5
            </p>
            <p className="text-slate-400 text-[11px]">
              Connected to: <span className="text-white font-semibold">{isLocalTarget ? 'Local Host (Linux Kernel / eno1)' : `${currentHost}:${sshPort}`}</span>
            </p>
            <p className="text-slate-500 text-[10px]">
              Type any shell command (e.g. <span className="text-cyan-300">uptime</span>, <span className="text-cyan-300">ip a</span>, <span className="text-cyan-300">df -h</span>, <span className="text-cyan-300">traceroute</span>, <span className="text-cyan-300">ss -tulpn</span>, <span className="text-cyan-300">systemctl status</span>) or click quick action buttons above.
            </p>
          </div>

          {/* History Entries */}
          {history.map((entry) => (
            <div key={entry.id} className="space-y-1.5 group">
              {/* Command line prompt */}
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">
                    {entry.target === 'localhost' ? 'root@v-monitor:~$ ' : `${sshUser}@${entry.target}:~$ `}
                  </span>
                  <span className="text-white font-semibold">{entry.command}</span>
                </div>
                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      entry.code === 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    exit {entry.code} ({entry.durationMs}ms)
                  </span>
                  <button
                    onClick={() => copyToClipboard(entry.stdout || entry.stderr, entry.id)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                    title="Copy command output"
                  >
                    {copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Stdout Output */}
              {entry.stdout && (
                <pre className="text-slate-200 bg-[#060A12] p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px] selection:bg-cyan-500/30">
                  {entry.stdout}
                </pre>
              )}

              {/* Stderr Output */}
              {entry.stderr && (
                <pre className="text-rose-400 bg-rose-950/20 p-3 rounded-lg border border-rose-900/40 whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px]">
                  {entry.stderr}
                </pre>
              )}
            </div>
          ))}

          {/* Pending execution pulse */}
          {execMutation.isPending && (
            <div className="space-y-1.5 animate-pulse text-cyan-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">
                  {isLocalTarget ? 'root@v-monitor:~$ ' : `${sshUser}@${currentHost}:~$ `}
                </span>
                <span className="text-white">{execMutation.variables}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px] p-2 bg-[#060A12] rounded border border-cyan-500/20">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Executing shell instruction on target subsystem...</span>
              </div>
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Input Bar */}
        <div className="p-3 bg-[#080D17] border-t border-slate-800 flex items-center gap-2">
          <div className="text-emerald-400 font-bold font-mono text-xs select-none">
            {isLocalTarget ? 'root@v-monitor:~$ ' : `${sshUser}@${currentHost}:~$ `}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={execMutation.isPending}
            placeholder={execMutation.isPending ? 'Executing...' : 'Type bash / CLI command and press Enter (use ↑/↓ for history)...'}
            className="flex-1 bg-transparent border-0 text-white font-mono text-xs focus:outline-none focus:ring-0 placeholder:text-slate-600"
            autoFocus
          />
          <button
            onClick={() => handleExecute()}
            disabled={!commandInput.trim() || execMutation.isPending}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-sm"
          >
            {execMutation.isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Run</span>
                <CornerDownLeft className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

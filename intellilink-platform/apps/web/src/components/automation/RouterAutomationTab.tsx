'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { Terminal, Copy, Check, Play, RefreshCw, Server, Cpu, FileCode, CheckCircle2, Shield, Code2 } from 'lucide-react';

export function RouterAutomationTab() {
  // Golden Config Generator State
  const [vendor, setVendor] = useState<'CISCO_IOS_XE' | 'MIKROTIK_ROUTEROS' | 'LINUX_WIREGUARD'>('CISCO_IOS_XE');
  const [siteName, setSiteName] = useState('Mumbai-Branch-01');
  const [wanInterface, setWanInterface] = useState('GigabitEthernet0/0/0');
  const [overlayIp, setOverlayIp] = useState('10.244.10.5');
  const [popEndpoint, setPopEndpoint] = useState('mumbai-pop.telecom.net:51820');
  const [pubKey, setPubKey] = useState('4vW8X7kY9aZbQ1dE3fG5hJ2lM4nO6pQ8rS0tU2vW4xY=');
  const [renderedConfig, setRenderedConfig] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // SSH & NETCONF Terminal State
  const [sshHost, setSshHost] = useState('192.168.0.50');
  const [sshPort, setSshPort] = useState('22');
  const [sshUser, setSshUser] = useState('noc_admin');
  const [sshPass, setSshPass] = useState('Cisco123!');
  const [sshVendor, setSshVendor] = useState<'CISCO' | 'MIKROTIK' | 'LINUX'>('CISCO');
  const [sshCommand, setSshCommand] = useState('show ip interface brief');
  const [sshOutput, setSshOutput] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'generator' | 'ssh' | 'netconf'>('generator');

  // NETCONF XML State
  const [netconfXml, setNetconfXml] = useState(
    `<rpc message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <get-config>
    <source>
      <running/>
    </source>
  </get-config>
</rpc>`
  );
  const [netconfReply, setNetconfReply] = useState<any>(null);

  // Render Template Mutation
  const renderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/automation/device/templates/render', {
        vendor,
        siteName,
        wanInterface,
        overlayIp,
        popEndpoint,
        wireguardPubKey: pubKey,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setRenderedConfig(data.config);
    },
  });

  // SSH Execution Mutation
  const sshMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/automation/device/ssh', {
        host: sshHost,
        port: parseInt(sshPort, 10) || 22,
        username: sshUser,
        password: sshPass,
        command: sshCommand,
        vendor: sshVendor,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSshOutput(data);
    },
    onError: (err: any) => {
      setSshOutput({
        code: 1,
        stderr: err.response?.data?.message || err.message,
        stdout: '',
        durationMs: 0,
      });
    },
  });

  // NETCONF RPC Mutation
  const netconfMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/automation/device/netconf', {
        host: sshHost,
        port: 830,
        username: sshUser,
        password: sshPass,
        rpcXml: netconfXml,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setNetconfReply(data);
    },
  });

  const copyConfig = () => {
    if (renderedConfig) {
      navigator.clipboard.writeText(renderedConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-5">
      {/* Sub-Tabs for Router Automation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#222E45] pb-2">
        <button
          onClick={() => setActiveSubTab('generator')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'generator'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Golden Config Generator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ssh')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'ssh'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Remote SSH CLI Driver</span>
        </button>

        <button
          onClick={() => setActiveSubTab('netconf')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'netconf'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>NETCONF / RESTCONF RPC</span>
        </button>
      </div>

      {/* Tab 1: Golden Config Generator */}
      {activeSubTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form */}
          <div className="lg:col-span-5 bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" /> Edge Platform Parameters
            </h3>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Target Vendor Hardware</label>
              <select
                value={vendor}
                onChange={(e: any) => {
                  setVendor(e.target.value);
                  if (e.target.value === 'MIKROTIK_ROUTEROS') setWanInterface('ether1');
                  else if (e.target.value === 'LINUX_WIREGUARD') setWanInterface('eno1');
                  else setWanInterface('GigabitEthernet0/0/0');
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-semibold"
              >
                <option value="CISCO_IOS_XE">Cisco IOS-XE (Catalyst 8000 / ISR 4000)</option>
                <option value="MIKROTIK_ROUTEROS">MikroTik RouterOS v7 (CCR / RB Series)</option>
                <option value="LINUX_WIREGUARD">Linux Bare-Metal / Firewall Appliance</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Branch Site Identifier</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Primary WAN Interface Name</label>
              <input
                type="text"
                value={wanInterface}
                onChange={(e) => setWanInterface(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Overlay IP</label>
                <input
                  type="text"
                  value={overlayIp}
                  onChange={(e) => setOverlayIp(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">PoP Endpoint</label>
                <input
                  type="text"
                  value={popEndpoint}
                  onChange={(e) => setPopEndpoint(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Sovereign PoP WireGuard PubKey</label>
              <input
                type="text"
                value={pubKey}
                onChange={(e) => setPubKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono truncate"
              />
            </div>

            <button
              onClick={() => renderMutation.mutate()}
              disabled={renderMutation.isPending}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {renderMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Generate Production Golden Config</span>
            </button>
          </div>

          {/* Config Output Terminal */}
          <div className="lg:col-span-7 bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden flex flex-col h-[520px] shadow-sm">
            <div className="px-4 py-3 bg-[#111726] border-b border-[#222E45] flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                {vendor} Golden Config Output
              </span>
              {renderedConfig && (
                <button
                  onClick={copyConfig}
                  className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Config'}</span>
                </button>
              )}
            </div>

            <pre className="p-4 flex-1 overflow-auto text-xs font-mono text-emerald-400 leading-relaxed select-all">
              {renderedConfig ||
                `# Click 'Generate Production Golden Config' to render an enterprise
# configuration for ${vendor}, including:
#  - Dual-WAN policy failover (Fiber + Starlink LEO)
#  - Sub-second BFD / IP SLA tracking
#  - Static route bypass for Starlink dish telemetry (192.168.100.1)
#  - WireGuard sovereign crypto tunnel encapsulation`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Remote SSH CLI Driver */}
      {activeSubTab === 'ssh' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-500" /> Remote Router SSH Command Dispatcher
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Router IP</label>
                <input
                  type="text"
                  value={sshHost}
                  onChange={(e) => setSshHost(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Port</label>
                <input
                  type="number"
                  value={sshPort}
                  onChange={(e) => setSshPort(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Username</label>
                <input
                  type="text"
                  value={sshUser}
                  onChange={(e) => setSshUser(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Password</label>
                <input
                  type="password"
                  value={sshPass}
                  onChange={(e) => setSshPass(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Vendor Syntax</label>
                <select
                  value={sshVendor}
                  onChange={(e: any) => {
                    setSshVendor(e.target.value);
                    if (e.target.value === 'MIKROTIK') setSshCommand('/interface print');
                    else if (e.target.value === 'LINUX') setSshCommand('ip -br addr');
                    else setSshCommand('show ip interface brief');
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200"
                >
                  <option value="CISCO">Cisco IOS-XE</option>
                  <option value="MIKROTIK">MikroTik RouterOS</option>
                  <option value="LINUX">Linux Appliance</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                value={sshCommand}
                onChange={(e) => setSshCommand(e.target.value)}
                placeholder="CLI Command to execute..."
                className="flex-1 w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono"
              />
              <button
                onClick={() => sshMutation.mutate()}
                disabled={sshMutation.isPending}
                className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0"
              >
                {sshMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Execute via SSH</span>
              </button>
            </div>
          </div>

          {/* Terminal Display */}
          <div className="bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden h-80 flex flex-col font-mono text-xs shadow-sm">
            <div className="px-4 py-2.5 bg-[#111726] border-b border-[#222E45] flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-200 font-bold">{sshHost}:{sshPort} ({sshVendor})</span>
              </div>
              {sshOutput && <span>Exit code: {sshOutput.code} ({sshOutput.durationMs}ms)</span>}
            </div>

            <pre className="p-4 flex-1 overflow-auto text-emerald-400 select-all leading-relaxed">
              {sshOutput?.stdout || sshOutput?.stderr || `Terminal ready. Enter command and click 'Execute via SSH'.`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: NETCONF / RESTCONF RPC */}
      {activeSubTab === 'netconf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-500" /> RFC 6241 NETCONF XML RPC
            </h3>
            <textarea
              rows={12}
              value={netconfXml}
              onChange={(e) => setNetconfXml(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-lg text-slate-900 dark:text-slate-200 font-mono leading-relaxed"
            />
            <button
              onClick={() => netconfMutation.mutate()}
              disabled={netconfMutation.isPending}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {netconfMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Dispatch NETCONF RPC (Port 830)</span>
            </button>
          </div>

          <div className="bg-[#0B0F17] border border-slate-200 dark:border-[#222E45] rounded-xl overflow-hidden flex flex-col h-96 shadow-sm">
            <div className="px-4 py-2.5 bg-[#111726] border-b border-[#222E45] text-xs font-mono text-slate-300 font-bold">
              NETCONF XML Response
            </div>
            <pre className="p-4 flex-1 overflow-auto text-xs font-mono text-cyan-400 select-all leading-relaxed">
              {netconfReply?.responseXml ||
                `<!-- RFC 6241 NETCONF <rpc-reply> will be rendered here upon dispatch -->`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

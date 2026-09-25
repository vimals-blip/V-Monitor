'use client';
import React, { useState } from 'react';
import {
  ShieldCheck, Shield, ExternalLink, RefreshCw, CheckCircle2,
  AlertTriangle, Lock, FileText, Globe2, Server, Award,
  ArrowUpRight, Cpu, Layers, Sparkles, Check
} from 'lucide-react';

const FRAMEWORKS = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    standard: 'AICPA Trust Services Criteria (2024)',
    score: 96,
    controlsPassed: 48,
    controlsTotal: 50,
    status: 'AUDIT_READY',
    color: 'emerald',
    description: 'Security, Availability, Confidentiality, and Processing Integrity verification for enterprise cloud and telecom data pipelines.',
    mappedControls: [
      { code: 'CC6.1', name: 'Logical Access Controls (Zero-Trust RBAC & MFA)', status: 'PASSED' },
      { code: 'CC6.6', name: 'Data in Transit Encryption (WireGuard ChaCha20-Poly1305)', status: 'PASSED' },
      { code: 'CC6.8', name: 'Tamper-Evident Audit Logging (SHA-256 Chain of Custody)', status: 'PASSED' },
      { code: 'A1.2', name: 'High-Availability Link Failover (<42ms BFD Redundancy)', status: 'PASSED' },
    ],
  },
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001:2022',
    standard: 'International ISMS Standard',
    score: 94,
    controlsPassed: 92,
    controlsTotal: 98,
    status: 'CERTIFIED',
    color: 'blue',
    description: 'Comprehensive Information Security Management System covering edge appliances, telecom PoPs, and carrier routing.',
    mappedControls: [
      { code: 'A.8.20', name: 'Network Security & Multi-Tenant Segmentation', status: 'PASSED' },
      { code: 'A.8.24', name: 'Use of Modern Cryptography & Key Management', status: 'PASSED' },
      { code: 'A.8.15', name: 'Logging & Monitoring (Continuous Kernel Telemetry)', status: 'PASSED' },
      { code: 'A.8.6', name: 'Capacity Management & Bandwidth Throttling', status: 'PASSED' },
    ],
  },
  {
    id: 'nist-csf',
    name: 'NIST CSF 2.0',
    standard: 'National Cybersecurity Framework',
    score: 92,
    controlsPassed: 86,
    controlsTotal: 93,
    status: 'ACTIVE',
    color: 'indigo',
    description: 'Critical infrastructure protection spanning Identify, Protect, Detect, Respond, and Recover governance pillars.',
    mappedControls: [
      { code: 'PR.DS-01', name: 'Data in Transit Protected via Dynamic IPSec/WireGuard', status: 'PASSED' },
      { code: 'DE.CM-01', name: 'Continuous Network Anomaly Detection via AI Engine', status: 'PASSED' },
      { code: 'RS.RP-01', name: 'Autonomous Circuit Flap Damping & Threat Isolation', status: 'PASSED' },
    ],
  },
  {
    id: 'sovereign-telecom',
    name: 'Sovereign Telecom & Data Residency',
    standard: 'National Telecom Regulatory & ETSI Framework',
    score: 100,
    controlsPassed: 34,
    controlsTotal: 34,
    status: 'FULLY_COMPLIANT',
    color: 'emerald',
    description: 'Strict in-country domestic breakout ensuring satellite underlays (Starlink) cannot leak sensitive packets outside national borders.',
    mappedControls: [
      { code: 'REG-POP-01', name: 'Domestic PoP In-Country Breakout Anchoring', status: 'PASSED' },
      { code: 'REG-ETSI-02', name: 'Lawful Interception Readiness (ETSI TS 102 232)', status: 'PASSED' },
      { code: 'REG-IP-03', name: 'National RIR / AFRINIC Regional IP Localization', status: 'PASSED' },
      { code: 'REG-UNDERLAY-04', name: 'Decoupled Foreign Underlay Cryptographic Isolation', status: 'PASSED' },
    ],
  },
  {
    id: 'pci-dss',
    name: 'PCI-DSS v4.0',
    standard: 'Payment Card Industry Data Security',
    score: 98,
    controlsPassed: 62,
    controlsTotal: 63,
    status: 'AUDIT_READY',
    color: 'purple',
    description: 'Protection of cardholder transaction environments across branch WAN edges, ATMs, and POS terminal meshes.',
    mappedControls: [
      { code: 'Req 1.3', name: 'Network Traffic Restriction & Ingress Drop ACLs', status: 'PASSED' },
      { code: 'Req 2.2', name: 'System Hardening & Golden Template Configuration', status: 'PASSED' },
      { code: 'Req 4.1', name: 'Strong Cryptography for Transmission over Open WANs', status: 'PASSED' },
    ],
  },
  {
    id: 'gdpr-dpdp',
    name: 'GDPR / DPDP Act',
    standard: 'Global Data Protection Regulations',
    score: 100,
    controlsPassed: 28,
    controlsTotal: 28,
    status: 'FULLY_COMPLIANT',
    color: 'emerald',
    description: 'Privacy by design, zero cleartext transmission across untrusted public clouds, and immutable audit trails.',
    mappedControls: [
      { code: 'Art. 32', name: 'Technical Security Measures & Pseudonymization', status: 'PASSED' },
      { code: 'Art. 30', name: 'Records of Processing Activities & Syslog Auditing', status: 'PASSED' },
    ],
  },
];

export default function AiComplianceIntegrationPage() {
  const [activeSource, setActiveSource] = useState<'local' | 'cloud'>('local');
  const [showEmbed, setShowEmbed] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState(FRAMEWORKS[0]);

  const localUrl = 'http://localhost:3005';
  const cloudUrl = 'https://ai-compliance-web-five.vercel.app';
  const currentUrl = activeSource === 'local' ? localUrl : cloudUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                AI Compliance &amp; Governance Center
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                DUAL-ENGINE ACTIVE
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unified SOC 2, ISO 27001, NIST CSF, and Sovereign Telecom Compliance. Seamlessly integrated with AI-Compliance platform.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-lg p-1 text-xs">
            <button
              onClick={() => setActiveSource('local')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                activeSource === 'local'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Local Engine (Port 3005)</span>
            </button>
            <button
              onClick={() => setActiveSource('cloud')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                activeSource === 'cloud'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Cloud Engine (Vercel)</span>
            </button>
          </div>

          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg bg-slate-900 dark:bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all"
          >
            <span>Launch Dedicated App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Engine Status Health Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LOCAL AI-COMPLIANCE</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">http://localhost:3005</span>
            </div>
            <span className="text-[11px] text-emerald-500 font-medium">Running on Dedicated Port 3005</span>
          </div>
          <a
            href="http://localhost:3005"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A2333] hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#222E45]"
            title="Open Local Web"
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CLOUD AI-COMPLIANCE</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate max-w-[190px]">
                ai-compliance-web-five.vercel.app
              </span>
            </div>
            <span className="text-[11px] text-blue-500 font-medium">Global Edge CDN Production</span>
          </div>
          <a
            href="https://ai-compliance-web-five.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A2333] hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#222E45]"
            title="Open Cloud Web"
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EMBEDDED WORKSPACE</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {showEmbed ? 'In-Console Viewer Active' : 'Scorecard Matrix Mode'}
            </div>
            <span className="text-[11px] text-slate-500">Toggle embedded iframe view</span>
          </div>
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showEmbed
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-[#1A2333] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#222E45]'
            }`}
          >
            {showEmbed ? 'Hide Embed' : 'Show Embed'}
          </button>
        </div>
      </div>

      {/* Embedded Iframe View (When Toggled) */}
      {showEmbed && (
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-2xl overflow-hidden shadow-2xl space-y-2">
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0E1420] border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Embedded: {currentUrl}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const iframe = document.getElementById('compliance-iframe') as HTMLIFrameElement;
                  if (iframe) iframe.src = currentUrl;
                }}
                className="p-1 rounded bg-slate-100 dark:bg-[#1A2333] text-slate-600 dark:text-slate-300 hover:text-white"
                title="Reload Embed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded bg-slate-100 dark:bg-[#1A2333] text-slate-600 dark:text-slate-300 hover:text-white"
                title="Pop out in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <iframe
            id="compliance-iframe"
            src={currentUrl}
            className="w-full h-[750px] border-0 rounded-b-2xl bg-white"
            title="AI Compliance Application"
          />
        </div>
      )}

      {/* Compliance Frameworks Scorecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FRAMEWORKS.map((fw) => {
          const isSelected = selectedFramework.id === fw.id;
          return (
            <div
              key={fw.id}
              onClick={() => setSelectedFramework(fw)}
              className={`bg-white dark:bg-[#121824] rounded-xl p-5 border cursor-pointer transition-all hover:scale-[1.01] shadow-sm ${
                isSelected
                  ? 'border-emerald-500 dark:border-emerald-500 shadow-md ring-1 ring-emerald-500'
                  : 'border-slate-200 dark:border-[#222E45] hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {fw.name}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">{fw.standard}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {fw.status}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{fw.score}%</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {fw.controlsPassed} of {fw.controlsTotal} controls passed
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-sm">
                  {fw.score}%
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-[#1C263A] h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                  style={{ width: `${fw.score}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">
                {fw.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Framework Audit Controls Detail */}
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1E293B] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedFramework.name} — Technical Control Verification
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live evidence mapping directly linked between V-Monitor telemetry/routing and AI-Compliance controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
              Score: {selectedFramework.score}% AUDIT READY
            </span>
          </div>
        </div>

        {/* Controls Table */}
        <div className="divide-y divide-slate-100 dark:divide-[#1E293B]">
          {selectedFramework.mappedControls.map((ctrl) => (
            <div key={ctrl.code} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1A2333] border border-slate-200 dark:border-[#222E45] font-mono font-bold text-slate-800 dark:text-slate-200">
                  {ctrl.code}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {ctrl.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-slate-400">Continuous Automated Probe</span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{ctrl.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Application Evidence Bridge */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            How V-Monitor and AI-Compliance Work Together
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          <strong>V-Monitor</strong> operates as the high-throughput Network Operations Center (NOC) and Autonomous SD-WAN Forwarding Plane, generating real hardware telemetry, BFD failover metrics, and WireGuard tunnels. <strong>AI-Compliance</strong> acts as the regulatory brain, autonomously ingesting V-Monitor’s audit logs and configurations to write auditor-ready policies, verify SOC 2/ISO 27001 controls, and generate exportable compliance packages for client stakeholders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">TELEMETRY TO EVIDENCE</span>
            <p className="text-xs text-slate-200">
              V-Monitor kernel counters and SLA uptime are auto-submitted as immutable compliance evidence.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">GENERATIVE POLICIES</span>
            <p className="text-xs text-slate-200">
              AI-Compliance writes custom security policies tailored precisely to Starlink, 5G, and WireGuard multi-WAN.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">ONE-CLICK AUDITOR EXPORT</span>
            <p className="text-xs text-slate-200">
              Download complete SOC 2 Type II and ISO 27001 evidence bundles directly from the compliance workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

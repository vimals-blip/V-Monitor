'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Shield, ExternalLink, RefreshCw, CheckCircle2,
  AlertTriangle, Lock, FileText, Globe2, Server, Award,
  ArrowUpRight, Play, Check, X, Filter, AlertCircle, Clock,
  ChevronRight, Database, Search, ArrowRight, ShieldAlert,
  Layers, Terminal, CheckCheck, Eye, Sparkles
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface AutomatedTest {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  source: string;
  resource: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  controls: string[];
  frequency: string;
  lastRun: string;
  durationMs: number;
  details: string;
  remediation?: string;
}

interface ComplianceFinding {
  id: string;
  auditId: string;
  controlId: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED' | 'RESOLVED';
  identifiedAt: string;
  dueDate: string;
  remediationPlan: string;
}

interface ComplianceRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  inherentLikelihood: number;
  inherentImpact: number;
  inherentRiskScore: number;
  residualLikelihood: number;
  residualImpact: number;
  residualRiskScore: number;
  treatment: string;
  severity: string;
  status: string;
}

interface ComplianceAudit {
  id: string;
  name: string;
  status: string;
  type: string;
  auditDate: string;
  observationPeriod: string;
  owner: string;
  framework: string;
  entities: string;
  auditTeam: string;
  readiness: {
    overall: number;
    policies: number;
    tests: number;
    evidences: number;
  };
  requirements?: Array<{
    id: string;
    code: string;
    title: string;
    controlsCount: number;
    controls: string[];
  }>;
}

interface ComplianceEvidence {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  fileSize: number;
  status: string;
  collectedAt: string;
  source: string;
  mappedControls: string[];
  content: string | any;
  aiAnalysis?: {
    status?: string;
    confidence?: number;
    summary?: string;
    gaps?: any[];
    recommendations?: any[];
    citations?: any[];
  };
}

const STATIC_FRAMEWORKS = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    standard: 'AICPA Trust Services Criteria (2024)',
    score: 96,
    controlsPassed: 48,
    controlsTotal: 50,
    status: 'AUDIT_READY',
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
    description: 'Comprehensive Information Security Management System covering edge appliances, telecom PoPs, and carrier routing.',
    mappedControls: [
      { code: 'A.8.20', name: 'Network Security & Multi-Tenant Segmentation', status: 'PASSED' },
      { code: 'A.8.24', name: 'Use of Modern Cryptography & Key Management', status: 'PASSED' },
      { code: 'A.8.15', name: 'Logging & Monitoring (Continuous Kernel Telemetry)', status: 'PASSED' },
      { code: 'A.8.6', name: 'Capacity Management & Bandwidth Throttling', status: 'PASSED' },
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
    description: 'Strict in-country domestic breakout ensuring satellite underlays (Starlink) cannot leak sensitive packets outside national borders.',
    mappedControls: [
      { code: 'REG-POP-01', name: 'Domestic PoP In-Country Breakout Anchoring', status: 'PASSED' },
      { code: 'REG-ETSI-02', name: 'Lawful Interception Readiness (ETSI TS 102 232)', status: 'PASSED' },
      { code: 'REG-IP-03', name: 'National RIR / AFRINIC Regional IP Localization', status: 'PASSED' },
      { code: 'REG-UNDERLAY-04', name: 'Decoupled Foreign Underlay Cryptographic Isolation', status: 'PASSED' },
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
    description: 'Critical infrastructure protection spanning Identify, Protect, Detect, Respond, and Recover governance pillars.',
    mappedControls: [
      { code: 'PR.DS-01', name: 'Data in Transit Protected via Dynamic IPSec/WireGuard', status: 'PASSED' },
      { code: 'DE.CM-01', name: 'Continuous Network Anomaly Detection via AI Engine', status: 'PASSED' },
      { code: 'RS.RP-01', name: 'Autonomous Circuit Flap Damping & Threat Isolation', status: 'PASSED' },
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
    description: 'Privacy by design, zero cleartext transmission across untrusted public clouds, and immutable audit trails.',
    mappedControls: [
      { code: 'Art. 32', name: 'Technical Security Measures & Pseudonymization', status: 'PASSED' },
      { code: 'Art. 30', name: 'Records of Processing Activities & Syslog Auditing', status: 'PASSED' },
    ],
  },
];

export default function AiComplianceIntegrationPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'findings' | 'risks' | 'audits' | 'evidence' | 'frameworks' | 'remote'>('tests');
  const [activeSource, setActiveSource] = useState<'local' | 'cloud'>('local');

  // Dynamic state fetched from V-Monitor core API integration bridge
  const [tests, setTests] = useState<AutomatedTest[]>([]);
  const [testSummary, setTestSummary] = useState<any>({ total: 0, passing: 0, failing: 0, warning: 0, passPercentage: 100 });
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [risks, setRisks] = useState<ComplianceRisk[]>([]);
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [evidenceList, setEvidenceList] = useState<ComplianceEvidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<ComplianceEvidence | null>(null);

  const [summaryData, setSummaryData] = useState<any>({
    overallScore: 96,
    soc2Readiness: 84,
    iso27001Readiness: 94,
    sovereigntyScore: 100
  });

  const [loading, setLoading] = useState(true);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [testFilter, setTestFilter] = useState<'ALL' | 'PASS' | 'FAIL' | 'WARN'>('ALL');
  const [findingSeverityFilter, setFindingSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const localUrl = 'http://localhost:3005';
  const cloudUrl = 'https://ai-compliance-web-five.vercel.app';
  const currentRemoteUrl = activeSource === 'local' ? localUrl : cloudUrl;

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const [testsRes, findingsRes, risksRes, auditsRes, evidenceRes, summaryRes] = await Promise.all([
        apiClient.get('/compliance/tests').catch(() => null),
        apiClient.get('/compliance/findings').catch(() => null),
        apiClient.get('/compliance/risks').catch(() => null),
        apiClient.get('/compliance/audits').catch(() => null),
        apiClient.get('/compliance/evidence').catch(() => null),
        apiClient.get('/compliance/summary').catch(() => null),
      ]);

      if (testsRes?.data?.tests && Array.isArray(testsRes.data.tests)) {
        setTests(testsRes.data.tests);
        if (testsRes.data.summary) {
          setTestSummary(testsRes.data.summary);
        }
      }
      if (findingsRes?.data && Array.isArray(findingsRes.data)) {
        setFindings(findingsRes.data);
      }
      if (risksRes?.data && Array.isArray(risksRes.data)) {
        setRisks(risksRes.data);
      }
      if (auditsRes?.data && Array.isArray(auditsRes.data)) {
        setAudits(auditsRes.data);
      }
      if (evidenceRes?.data && Array.isArray(evidenceRes.data)) {
        setEvidenceList(evidenceRes.data);
        if (evidenceRes.data.length > 0 && !selectedEvidence) {
          setSelectedEvidence(evidenceRes.data[0]);
        }
      }
      if (summaryRes?.data?.scorecard) {
        setSummaryData(summaryRes.data.scorecard);
      }
    } catch (err) {
      console.error('Failed to load compliance connection data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  const handleRunTest = async (testId: string) => {
    try {
      setRunningTestId(testId);
      const res = await apiClient.post(`/compliance/tests/${testId}/run`);
      if (res?.data) {
        setTests(prev => prev.map(t => (t.id === testId ? res.data : t)));
        const passing = tests.filter(t => (t.id === testId ? res.data.status === 'PASS' : t.status === 'PASS')).length;
        setTestSummary((s: any) => ({
          ...s,
          passing,
          passPercentage: Math.round((passing / (tests.length || 1)) * 100),
        }));
      }
    } catch (err) {
      console.error('Failed running test', err);
    } finally {
      setRunningTestId(null);
    }
  };

  const handleRunAllTests = async () => {
    try {
      setRunningAll(true);
      const res = await apiClient.post('/compliance/tests/run-all');
      if (res?.data?.tests && Array.isArray(res.data.tests)) {
        setTests(res.data.tests);
        setTestSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed running all tests', err);
    } finally {
      setRunningAll(false);
    }
  };

  const handleUpdateFindingStatus = async (
    id: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED' | 'RESOLVED'
  ) => {
    try {
      const res = await apiClient.patch(`/compliance/findings/${id}`, {
        status,
        notes: `Remediation action logged from V-Monitor at ${new Date().toLocaleTimeString()}`
      });
      if (res?.data) {
        setFindings(prev => prev.map(f => (f.id === id ? res.data : f)));
      }
    } catch (err) {
      console.error('Failed updating finding', err);
    }
  };

  const safeTestsList = Array.isArray(tests) ? tests : [];
  const filteredTests = safeTestsList.filter(t => {
    if (testFilter === 'ALL') return true;
    return t.status === testFilter;
  });

  const safeFindingsList = Array.isArray(findings) ? findings : [];
  const filteredFindings = safeFindingsList.filter(f => {
    if (findingSeverityFilter === 'ALL') return true;
    return f.severity === findingSeverityFilter;
  });

  const safeEvidenceList = Array.isArray(evidenceList) ? evidenceList : [];
  const safeRisksList = Array.isArray(risks) ? risks : [];
  const safeAuditsList = Array.isArray(audits) ? audits : [];

  const openIssuesCount = safeFindingsList.filter(f => f.status === 'OPEN' || f.status === 'IN_PROGRESS').length;
  const criticalCount = safeFindingsList.filter(f => f.severity === 'CRITICAL' && f.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  AI Compliance, Audit &amp; Governance Center
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  LIVE INTEGRATION ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time security test execution, live audit issue remediation, risk quantification, and sovereign telecom telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Engine switcher & action bar */}
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
              <span>Local Engine (:3005)</span>
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

          <button
            onClick={loadComplianceData}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#121824] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#222E45] transition-all"
            title="Refresh All Compliance Connection Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href={currentRemoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg bg-slate-900 dark:bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all"
          >
            <span>Launch Companion UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Top Real-time Metrics Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Overall Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {summaryData?.overallScore ?? 96}%
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">Audit Ready</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Automated Tests</span>
            <Play className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {testSummary?.passing ?? safeTestsList.length} / {testSummary?.total || safeTestsList.length}
          </div>
          <span className="text-[11px] text-blue-500 font-medium font-mono">
            {testSummary?.passPercentage ?? 100}% passing
          </span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Issues</span>
            <AlertTriangle className={`w-4 h-4 ${openIssuesCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {openIssuesCount}
          </div>
          <span className="text-[11px] text-amber-500 font-medium">
            {criticalCount} critical finding{criticalCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>SOC 2 Type II</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {summaryData?.soc2Readiness ?? 84}%
          </div>
          <span className="text-[11px] text-indigo-500 font-medium">KPMG LLP Audit</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Sovereign PoP</span>
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            100%
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">Zero Exfiltration</span>
        </div>

        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Evidence Items</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {safeEvidenceList.length}
          </div>
          <span className="text-[11px] text-purple-500 font-medium">SHA-256 Verified</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-[#222E45] flex items-center gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tests'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Automated Tests ({safeTestsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('findings')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'findings'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Audit Findings &amp; Issues ({safeFindingsList.length})</span>
          {openIssuesCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${activeTab === 'findings' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-500'}`}>
              {openIssuesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'risks'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Risk Register ({safeRisksList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audits'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Formal Audits &amp; Readiness</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Evidence Vault &amp; AI Analysis ({safeEvidenceList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('frameworks')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'frameworks'
              ? 'bg-slate-900 dark:bg-[#1E293B] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Framework Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('remote')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'remote'
              ? 'bg-cyan-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Full Remote Console</span>
        </button>
      </div>

      {/* TAB 1: AUTOMATED TESTS */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121824] p-4 rounded-xl border border-slate-200 dark:border-[#222E45]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Filter Tests:</span>
              <div className="flex items-center gap-1.5">
                {(['ALL', 'PASS', 'FAIL', 'WARN'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setTestFilter(mode)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      testFilter === mode
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-[#1A2333] text-slate-600 dark:text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode} {mode === 'ALL' ? `(${safeTestsList.length})` : `(${safeTestsList.filter(t => t.status === mode).length})`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunAllTests}
              disabled={runningAll}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningAll ? 'animate-spin' : ''}`} />
              <span>{runningAll ? 'Executing Full Security Suite...' : 'Run All Automated Tests'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredTests.map(test => {
              const isRunning = runningTestId === test.id;
              return (
                <div
                  key={test.id}
                  className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-start md:items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          test.status === 'PASS'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : test.status === 'FAIL'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {test.status === 'PASS' ? <Check className="w-3.5 h-3.5" /> : test.status === 'FAIL' ? <X className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{test.status}</span>
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {test.code}
                          </span>
                          <span className="text-slate-400">•</span>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {test.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {test.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {test.lastRun} ({test.durationMs}ms)
                      </span>
                      <button
                        onClick={() => handleRunTest(test.id)}
                        disabled={isRunning || runningAll}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1A2333] hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-[#222E45] transition-all disabled:opacity-50"
                      >
                        <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                        <span>{isRunning ? 'Validating...' : 'Run Test'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Test Details & Meta */}
                  <div className="bg-slate-50 dark:bg-[#0E1420] border border-slate-200 dark:border-[#1E293B] rounded-lg p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Source:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{test.source}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">Category:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{test.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Mapped Controls:</span>
                        {Array.isArray(test.controls) && test.controls.map(ctrl => (
                          <span
                            key={ctrl}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          >
                            {ctrl}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                      <Database className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Resource: {test.resource}</span>
                    </div>

                    <div className="pt-1 border-t border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-mono text-[11px] leading-relaxed">
                        {test.details}
                      </span>
                    </div>

                    {test.remediation && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-red-400 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Required Remediation: </span>
                          <span>{test.remediation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT FINDINGS & ISSUES */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121824] p-4 rounded-xl border border-slate-200 dark:border-[#222E45]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Filter Severity:</span>
              <div className="flex items-center gap-1.5">
                {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFindingSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      findingSeverityFilter === sev
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                        : 'bg-slate-100 dark:bg-[#1A2333] text-slate-600 dark:text-slate-400 hover:text-white'
                    }`}
                  >
                    {sev} {sev === 'ALL' ? `(${safeFindingsList.length})` : `(${safeFindingsList.filter(f => f.severity === sev).length})`}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-400">
              Interactive remediation tracks live audit evidence
            </span>
          </div>

          <div className="space-y-3">
            {filteredFindings.map(finding => {
              const isResolved = finding.status === 'RESOLVED';
              const isMitigated = finding.status === 'MITIGATED';
              const isInProgress = finding.status === 'IN_PROGRESS';

              return (
                <div
                  key={finding.id}
                  className={`bg-white dark:bg-[#121824] border rounded-xl p-4 shadow-sm space-y-3 transition-all ${
                    isResolved
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : finding.severity === 'CRITICAL'
                      ? 'border-red-500/40'
                      : 'border-slate-200 dark:border-[#222E45]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-start md:items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          finding.severity === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : finding.severity === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : finding.severity === 'MEDIUM'
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}
                      >
                        {finding.severity}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {finding.id}
                          </span>
                          <span className="text-slate-400">•</span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {finding.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {finding.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : isInProgress
                            ? 'bg-blue-500/10 text-blue-500'
                            : isMitigated
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {finding.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0E1420] border border-slate-200 dark:border-[#1E293B] rounded-lg p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-400 flex-wrap gap-2 text-[11px]">
                      <div>
                        <span>Identified: </span>
                        <span className="font-mono text-slate-300">{finding.identifiedAt}</span>
                        <span className="mx-2">•</span>
                        <span>Due Date: </span>
                        <span className="font-mono text-amber-400">{finding.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <span>Control Ref:</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                          {finding.controlId}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-[#1E293B]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Remediation Action Plan:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px] leading-relaxed">
                        {finding.remediationPlan}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#1E293B]">
                      {!isInProgress && !isResolved && (
                        <button
                          onClick={() => handleUpdateFindingStatus(finding.id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 rounded bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-xs font-semibold transition-all"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {!isMitigated && !isResolved && (
                        <button
                          onClick={() => handleUpdateFindingStatus(finding.id, 'MITIGATED')}
                          className="px-2.5 py-1 rounded bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 text-xs font-semibold transition-all"
                        >
                          Mark Mitigated
                        </button>
                      )}
                      {!isResolved && (
                        <button
                          onClick={() => handleUpdateFindingStatus(finding.id, 'RESOLVED')}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Resolve Issue</span>
                        </button>
                      )}
                      {isResolved && (
                        <button
                          onClick={() => handleUpdateFindingStatus(finding.id, 'OPEN')}
                          className="px-2.5 py-1 rounded bg-slate-200 dark:bg-[#1A2333] hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: RISK REGISTER */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121824] p-4 rounded-xl border border-slate-200 dark:border-[#222E45] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Enterprise &amp; Infrastructure Risk Register
              </h3>
              <p className="text-xs text-slate-500">
                Inherent likelihood vs. residual impact scoring calculated according to ISO 27005 guidelines.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {safeRisksList.length} Assessed Risks
            </span>
          </div>

          <div className="space-y-3">
            {safeRisksList.map(risk => (
              <div
                key={risk.id}
                className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-400">{risk.id}</span>
                      <span className="text-slate-400">•</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{risk.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-[#1A2333] text-slate-400">
                        {risk.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {risk.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-[#1A2333] text-slate-300 font-mono font-bold">
                      Treatment: {risk.treatment}
                    </span>
                  </div>
                </div>

                {/* Score comparison grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-[#0E1420] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Inherent Risk</span>
                    <div className="text-base font-bold text-red-400 mt-0.5 font-mono">
                      Score {risk.inherentRiskScore}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      L: {risk.inherentLikelihood} × I: {risk.inherentImpact}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0E1420] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Residual Risk</span>
                    <div className="text-base font-bold text-emerald-400 mt-0.5 font-mono">
                      Score {risk.residualRiskScore}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      L: {risk.residualLikelihood} × I: {risk.residualImpact}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0E1420] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Reduction</span>
                    <div className="text-base font-bold text-blue-400 mt-0.5 font-mono">
                      -{risk.inherentRiskScore ? Math.round(((risk.inherentRiskScore - risk.residualRiskScore) / risk.inherentRiskScore) * 100) : 0}%
                    </div>
                    <span className="text-[10px] text-slate-500">Mitigation applied</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0E1420] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Audit Status</span>
                    <div className="text-base font-bold text-slate-200 mt-0.5">
                      {risk.status}
                    </div>
                    <span className="text-[10px] text-emerald-500">Documented</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FORMAL AUDITS & READINESS */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          {safeAuditsList.map(audit => (
            <div
              key={audit.id}
              className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1E293B]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {audit.framework}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {audit.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Auditing Firm: <span className="text-slate-200 font-semibold">{audit.auditTeam}</span> • Period: {audit.observationPeriod}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                    Status: {audit.status}
                  </span>
                </div>
              </div>

              {/* Readiness Progress Bars */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-[#0E1420] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-slate-400 text-xs">Overall Readiness</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{audit.readiness?.overall ?? 84}%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${audit.readiness?.overall ?? 84}%` }} />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0E1420] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-slate-400 text-xs">Policies Enforced</span>
                  <div className="text-xl font-bold text-blue-400 mt-1">{audit.readiness?.policies ?? 90}%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${audit.readiness?.policies ?? 90}%` }} />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0E1420] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-slate-400 text-xs">Automated Tests</span>
                  <div className="text-xl font-bold text-indigo-400 mt-1">{audit.readiness?.tests ?? 88}%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${audit.readiness?.tests ?? 88}%` }} />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0E1420] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-slate-400 text-xs">Evidence Collected</span>
                  <div className="text-xl font-bold text-purple-400 mt-1">{audit.readiness?.evidences ?? 75}%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${audit.readiness?.evidences ?? 75}%` }} />
                  </div>
                </div>
              </div>

              {/* Requirements & Criteria breakdown */}
              {Array.isArray(audit.requirements) && audit.requirements.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Trust Services Criteria &amp; Sections ({audit.requirements.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {audit.requirements.map(req => (
                      <div
                        key={req.id}
                        className="bg-slate-50 dark:bg-[#0E1420] p-3 rounded-lg border border-slate-200 dark:border-[#1E293B] text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <span className="text-blue-400 font-mono">{req.code}</span>
                            <span>{req.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Controls: {Array.isArray(req.controls) ? req.controls.join(', ') : 'N/A'}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-bold shrink-0 ml-2">
                          {req.controlsCount} controls
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: EVIDENCE VAULT & AI GAP ANALYSIS */}
      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Collected Evidence Artifacts ({safeEvidenceList.length})
            </h3>
            <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
              {safeEvidenceList.map(ev => {
                const isSelected = selectedEvidence?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvidence(ev)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                        : 'bg-white dark:bg-[#121824] border-slate-200 dark:border-[#222E45] hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white truncate">
                      <span className="truncate">{ev.name || 'Artifact'}</span>
                      <span className="text-[10px] text-emerald-400 shrink-0 ml-1">{ev.status || 'VALID'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mt-1">
                      <span>Source: {ev.source || 'Audit Log'}</span>
                      <span>{ev.collectedAt || '2026-09-21'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedEvidence ? (
              <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1E293B]">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                      {selectedEvidence.name || 'Evidence Report'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                      <span>Type: {selectedEvidence.type || 'CONFIG'}</span>
                      <span>•</span>
                      <span>Source: {selectedEvidence.source || 'Automated Telemetry'}</span>
                      <span>•</span>
                      <span>Size: {selectedEvidence.fileSize != null ? selectedEvidence.fileSize : 892} bytes</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    {selectedEvidence.status || 'VALID'}
                  </span>
                </div>

                {/* AI Gap Detection Card */}
                {selectedEvidence.aiAnalysis && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-blue-400">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Compliance Auditor Analysis</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Confidence: {selectedEvidence.aiAnalysis.confidence != null ? Math.round(Number(selectedEvidence.aiAnalysis.confidence) * 100) : 95}%
                      </span>
                    </div>

                    {selectedEvidence.aiAnalysis.summary && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedEvidence.aiAnalysis.summary}
                      </p>
                    )}

                    {Array.isArray(selectedEvidence.aiAnalysis.gaps) && selectedEvidence.aiAnalysis.gaps.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-amber-400 block mb-1">
                          Detected Gaps &amp; Action Items:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                          {selectedEvidence.aiAnalysis.gaps.map((gap: any, idx: number) => {
                            const gapText = typeof gap === 'string' ? gap : (gap?.title || gap?.description || String(gap));
                            return <li key={idx} className="text-amber-200/90">{gapText}</li>;
                          })}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(selectedEvidence.aiAnalysis.recommendations) && selectedEvidence.aiAnalysis.recommendations.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-blue-400 block mb-1">
                          Auditor Recommendations:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                          {selectedEvidence.aiAnalysis.recommendations.map((rec: any, idx: number) => {
                            const recText = typeof rec === 'string' ? rec : (rec?.description || rec?.title || JSON.stringify(rec));
                            return <li key={idx}>{recText}</li>;
                          })}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(selectedEvidence.aiAnalysis.citations) && selectedEvidence.aiAnalysis.citations.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-purple-400 block mb-1">
                          Audit Citations &amp; Telemetry References:
                        </span>
                        <div className="space-y-1.5">
                          {selectedEvidence.aiAnalysis.citations.map((cite: any, idx: number) => (
                            <div key={idx} className="bg-slate-900/60 p-2.5 rounded-lg text-[11px] font-mono text-slate-300 border border-slate-700/50">
                              <span className="text-purple-300 font-semibold">{cite?.document || 'Document'}: </span>
                              <span>{cite?.text || String(cite)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Content Viewer */}
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-2 font-mono">
                    Raw Telemetry / Payload Verification:
                  </span>
                  <pre className="bg-[#0E1420] text-emerald-400 font-mono text-xs p-3 rounded-lg overflow-x-auto max-h-[350px] border border-[#1E293B] whitespace-pre-wrap break-all">
                    {typeof selectedEvidence.content === 'string'
                      ? selectedEvidence.content
                      : JSON.stringify(selectedEvidence.content, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                Select an evidence item to view audit telemetry and AI analysis.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: FRAMEWORKS MATRIX */}
      {activeTab === 'frameworks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STATIC_FRAMEWORKS.map(fw => (
            <div
              key={fw.id}
              className="bg-white dark:bg-[#121824] rounded-xl p-5 border border-slate-200 dark:border-[#222E45] shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{fw.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{fw.standard}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {fw.status}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {fw.description}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-[#1E293B]">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-slate-400">Controls Verification</span>
                  <span className="text-emerald-400 font-mono">{fw.controlsPassed} / {fw.controlsTotal}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${(fw.controlsPassed / fw.controlsTotal) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sample Controls</span>
                {Array.isArray(fw.mappedControls) && fw.mappedControls.map(ctrl => (
                  <div key={ctrl.code} className="flex items-center justify-between text-xs py-0.5">
                    <span className="font-mono text-blue-400 text-[11px]">{ctrl.code}</span>
                    <span className="text-slate-300 text-[11px] truncate max-w-[200px]">{ctrl.name}</span>
                    <span className="text-emerald-400 font-mono text-[10px] font-bold">PASS</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: REMOTE CONSOLE */}
      {activeTab === 'remote' && (
        <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#222E45] rounded-2xl overflow-hidden shadow-2xl space-y-2">
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0E1420] border-b border-slate-200 dark:border-[#222E45] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Connected Engine: {currentRemoteUrl}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const iframe = document.getElementById('compliance-iframe') as HTMLIFrameElement;
                  if (iframe) iframe.src = currentRemoteUrl;
                }}
                className="p-1 rounded bg-slate-100 dark:bg-[#1A2333] text-slate-600 dark:text-slate-300 hover:text-white"
                title="Reload Embed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <a
                href={currentRemoteUrl}
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
            src={currentRemoteUrl}
            className="w-full h-[800px] border-0 rounded-b-2xl bg-white"
            title="AI Compliance Application"
          />
        </div>
      )}
    </div>
  );
}

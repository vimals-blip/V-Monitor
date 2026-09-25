# IntelliLink OS: Documentation Suite & Master Index

Welcome to the canonical technical and operational documentation repository for **IntelliLink OS** (Next-Generation Autonomous Carrier & Enterprise SD-WAN Platform).

This suite is organized into modular, authoritative manuals designed for network architects, sales executives, field deployment technicians, compliance officers, and NOC operations teams.

---

## 📚 Master Documentation Map

```
docs/
├── README.md                                             # [This file] Master Index & Navigation Guide
├── 01_ENTERPRISE_CLIENT_PITCH_AND_VALUE_PROPOSITION.md    # Commercial presentation, ROI, competitive matrix, elevator pitch
├── 02_STARLINK_SATELLITE_EDGE_INTEGRATION_GUIDE.md       # LEO satellite edge deployment, bypass mode, telemetry & failover
├── 03_ENTERPRISE_NOG_CARRIER_PLATFORM_MANUAL.md          # 20 operational NOC modules, telemetry, SLA monitoring & alarms
├── 04_SOVEREIGN_GOVERNANCE_AND_REGULATORY_FRAMEWORK.md   # Data residency, lawful interception, underlay separation, AFRINIC IP
├── 05_CLIENT_DEMO_AND_SCREEN_SHARE_RUNBOOK.md            # Step-by-step live demonstration runbook for client presentations
├── 06_ARCHITECTURE_AND_SYSTEM_DESIGN.md                  # Control vs data plane, microservices, MySQL 8, FastAPI, WebSockets
├── 07_API_AND_INTEGRATION_REFERENCE.md                   # REST API schemas, WebSocket mTLS bus, SNMP/NETCONF bindings
├── 08_DEPLOYMENT_AND_OPERATIONS_MANUAL.md                # Bare-metal setup, systemd units, backup routines, troubleshooting
└── 09_ARCHITECTURE_CAPABILITY_AND_FEATURE_MAPPING.md     # Target architecture audit, component status, and UI tab mapping
```

---

## 📑 Document Catalog & Target Audience

| # | Document | Target Audience | Key Contents |
| :-: | :--- | :--- | :--- |
| **01** | [**Enterprise Client Pitch & Value Proposition**](01_ENTERPRISE_CLIENT_PITCH_AND_VALUE_PROPOSITION.md) | C-Level, CIOs, Enterprise Sales | • 30-Second Elevator Pitch<br>• 60%–75% Cost Reduction vs Legacy MPLS<br>• Competitor Comparison (Meraki, Fortinet, SolarWinds)<br>• 5-Minute Demo Script & Commercial Pricing Models |
| **02** | [**Starlink Satellite Edge Integration Guide**](02_STARLINK_SATELLITE_EDGE_INTEGRATION_GUIDE.md) | Field Technicians, Edge Installers | • Rapid Site Deployment (<24 Hours vs 60-90 Days)<br>• Starlink Gen2/Gen3 Bypass Mode Setup<br>• Dish Diagnostics (`192.168.100.1` gRPC/HTTP)<br>• WireGuard CGNAT Traversal & Dynamic Sub-Second Steering |
| **03** | [**Enterprise NOC Carrier Platform Manual**](03_ENTERPRISE_NOG_CARRIER_PLATFORM_MANUAL.md) | Carrier NOC Operators, Network Leads | • Complete Walkthrough of all 20 Operational Modules<br>• Real Linux Kernel Telemetry (`/sys/class/net`, `eno1`)<br>• Sub-second BFD / ICMP Ping Probing Engine<br>• Zero Synthetic Mock Data / Live Hardware Pipeline |
| **04** | [**Sovereign Governance & Regulatory Framework**](04_SOVEREIGN_GOVERNANCE_AND_REGULATORY_FRAMEWORK.md) | Telecom Regulators, Legal, Compliance | • Underlay/Overlay Cryptographic Decoupling<br>• Domestic PoP In-Country Traffic Anchoring<br>• Lawful Interception (ETSI TS 102 232 / CALEA compliance)<br>• AFRINIC Regional IP Addressing & Data Residency |
| **05** | [**Client Demo & Screen Share Runbook**](05_CLIENT_DEMO_AND_SCREEN_SHARE_RUNBOOK.md) | Solution Architects, Technical Sales | • Live Screen-Share Script with Timestamps<br>• Live Cable-Pull & Link Flap Failover Simulation<br>• QoS Prioritization Demo (VoIP protected under congestion)<br>• Handling Tough Client Objections |
| **06** | [**Architecture & System Design**](06_ARCHITECTURE_AND_SYSTEM_DESIGN.md) | Software Engineers, System Architects | • Forwarding Plane vs Control Plane Separation<br>• Microservices Topology (NestJS, FastAPI, Next.js 14)<br>• MySQL 8.0 Microsecond Time-Series Schema<br>• Event-Driven WebSocket Bus & Distributed State |
| **07** | [**API & Integration Reference**](07_API_AND_INTEGRATION_REFERENCE.md) | Integration Engineers, DevOps | • Complete REST API Catalog (`/api/v1/*`)<br>• Dynamic Host Binding Logic (avoiding connection errors)<br>• WebSocket Message Payloads & Subscriptions<br>• DTO Specifications and Code Snippets |
| **08** | [**Deployment & Operations Manual**](08_DEPLOYMENT_AND_OPERATIONS_MANUAL.md) | SREs, Systems Administrators | • Production Ubuntu 22.04 LTS Bare-Metal Setup<br>• Environment Configurations (`.env` specifications)<br>• systemd Unit Files & Automated Recovery<br>• Database Backups & Runbooks for Connection/Bootstrap Errors |
| **09** | [**Architecture & UI Feature Mapping**](09_ARCHITECTURE_CAPABILITY_AND_FEATURE_MAPPING.md) | Network Engineers, Product Owners, NOC Ops | • Complete Target Architecture Component Audit<br>• Exact UI Sidebar Group, Tab Name & URL Mapping<br>• Edge Agent Operation (Cisco GuestShell, MikroTik, Linux)<br>• Multi-WAN Underlay Orchestration (Fiber, 5G, Starlink) |

---

## 🚀 Quick Start: Verifying Platform Services

To verify the platform is fully operational before a client meeting or deployment:

```bash
# 1. Check all background services
systemctl status intellilink-api intellilink-web intellilink-ai --no-pager

# 2. Query REST API Health
curl -s http://127.0.0.1:3001/health | jq .

# 3. Test Web NOC UI Reachability
curl -I http://127.0.0.1:3000

# 4. Check Edge Agent Installer Availability
curl -s http://127.0.0.1:3001/api/v1/network-discovery/agent/install.sh | head -n 5
```

---

*IntelliLink OS — Engineered for Carrier-Grade Autonomous Reliability.*

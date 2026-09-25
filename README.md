# IntelliLink OS (V-Monitor)
### Autonomous Multi-Orbit SD-WAN & Carrier Network Operations Center

[![Kernel: Linux 5.15+](https://img.shields.io/badge/Kernel-Linux%205.15%2B-blue.svg)](https://kernel.org)
[![Backend: NestJS 10](https://img.shields.io/badge/API-NestJS%2010-red.svg)](https://nestjs.com)
[![Frontend: Next.js 14](https://img.shields.io/badge/NOC-Next.js%2014-black.svg)](https://nextjs.org)
[![AI Engine: FastAPI](https://img.shields.io/badge/AI%20Engine-FastAPI%20%7C%20Python-green.svg)](https://fastapi.tiangolo.com)
[![Database: MySQL 8.0](https://img.shields.io/badge/Database-MySQL%208.0-orange.svg)](https://mysql.com)

**IntelliLink OS** is an enterprise-grade Autonomous SD-WAN and Network Operations Center (NOC) platform engineered for carriers, telecom operators, multi-branch corporations, and mission-critical government infrastructure. 

The platform seamlessly aggregates disparate WAN underlays—including **Starlink LEO Satellite**, 5G/LTE cellular, terrestrial fiber, and microwave—into a single self-healing, cryptographically secure mesh network with real-time AI link optimization and sub-second failover.

---

## 🌟 Key Capabilities

1. **Sub-24-Hour Remote Site Provisioning:** Connect remote mines, offshore platforms, and rural branches immediately via Starlink LEO without waiting 60–90 days for terrestrial carrier backhauls.
2. **Deterministic Sub-Second Failover:** Zero-drop link failover using continuous Linux kernel sysfs telemetry and active BFD probing. Critical sessions (VoIP, ERP, financial transactions) survive line cuts seamlessly.
3. **Sovereign In-Country Traffic Anchoring:** Complete decoupling of foreign satellite underlays from application overlays, ensuring all encrypted payloads break out strictly through sovereign domestic telecom PoPs.
4. **Autonomous AI Link Optimization:** Integrated FastAPI inference engine analyzing link jitter, packet loss, and latency variance to dynamically steer traffic before human-noticeable degradation occurs.
5. **Real Hardware Telemetry Pipeline:** 100% production telemetry collected directly from Linux kernel sockets, `/proc/net/arp`, and interface counters—no synthetic or simulated data.

---

## 📚 Official Documentation Suite

The complete, authoritative documentation suite is maintained in [`docs/`](docs/README.md):

| Document | Description |
| :--- | :--- |
| [**01. Client Pitch & Value Proposition**](docs/01_ENTERPRISE_CLIENT_PITCH_AND_VALUE_PROPOSITION.md) | Executive pitch, ROI calculation (60-75% savings), competitive matrix vs Meraki & Fortinet, commercial licensing. |
| [**02. Starlink Satellite Edge Integration Guide**](docs/02_STARLINK_SATELLITE_EDGE_INTEGRATION_GUIDE.md) | Rapid Starlink deployment, Gen2/Gen3 Bypass Mode, `192.168.100.1` dish telemetry, outbound WireGuard CGNAT traversal. |
| [**03. Enterprise NOC Carrier Platform Manual**](docs/03_ENTERPRISE_NOG_CARRIER_PLATFORM_MANUAL.md) | Full 20-module operational walkthrough, kernel metrics, SLA compliance engine, active BFD ping probing. |
| [**04. Sovereign Governance & Regulatory Framework**](docs/04_SOVEREIGN_GOVERNANCE_AND_REGULATORY_FRAMEWORK.md) | Telecommunications regulatory compliance, domestic PoP breakout, lawful interception (ETSI / CALEA), data residency. |
| [**05. Client Demo & Screen Share Runbook**](docs/05_CLIENT_DEMO_AND_SCREEN_SHARE_RUNBOOK.md) | Step-by-step presentation script for technical evaluations, live cable-pull demo, and customer objection handling. |
| [**06. Architecture & System Design**](docs/06_ARCHITECTURE_AND_SYSTEM_DESIGN.md) | Technical system architecture, Forwarding vs Control Plane, NestJS microservices, MySQL 8 schema, Next.js 14 NOC. |
| [**07. API & Integration Reference**](docs/07_API_AND_INTEGRATION_REFERENCE.md) | REST API endpoints, DTO contracts, dynamic client host resolution, and mTLS WebSocket telemetry streams. |
| [**08. Deployment & Operations Manual**](docs/08_DEPLOYMENT_AND_OPERATIONS_MANUAL.md) | Production bare-metal installation, systemd unit files, environment configurations, backup routines, and troubleshooting runbooks. |
| [**09. Architecture & UI Feature Mapping**](docs/09_ARCHITECTURE_CAPABILITY_AND_FEATURE_MAPPING.md) | Target architecture component audit, exact UI sidebar tabs and URL routes, edge agent operation, and transport failover. |

---

## 🏗️ Platform Architecture

```
+-----------------------------------------------------------------------------------+
|                           Next.js 14 Web NOC (Port 3000)                          |
|         Live Dashboards • Topology Maps • Link Health • Diagnostic Tools          |
+-----------------------------------------+-----------------------------------------+
                                          | REST / WebSockets
+-----------------------------------------v-----------------------------------------+
|                          NestJS Core Engine (Port 3001)                           |
|       Telemetry Aggregator • Discovery Service • BFD Probe • Audit Engine         |
+-------------------+---------------------+--------------------+--------------------+
                    |                     |                    |
        +-----------v-----------+         |        +-----------v-----------+
        |   FastAPI AI Engine   |         |        |     MySQL 8.0 DB      |
        |      (Port 8100)      |         |        |      (Port 3306)      |
        |  Predictive Steering  |         |        | Microsecond Telemetry |
        +-----------------------+         |        +-----------------------+
                                          |
+-----------------------------------------v-----------------------------------------+
|                              Linux Kernel Network Plane                           |
|      sysfs Telemetry • WireGuard Multi-WAN Mesh • Routing Policy • eBPF/QoS       |
+------------------+----------------------+--------------------+--------------------+
                   |                      |                    |
             [Starlink LEO]           [5G / LTE]         [Fiber / MPLS]
```

---

## 🚀 Quick Verification

```bash
# Verify API Health
curl -s http://localhost:3001/health | jq .

# Verify AI Engine Health
curl -s http://localhost:8100/health | jq .

# Verify Web NOC Interface
curl -I http://localhost:3000
```

---

## 📄 License & Commercial Distribution

Confidential & Proprietary. All rights reserved. Designed for carrier telecom networks, sovereign government backbones, and enterprise infrastructure.

# V-Monitor (IntelliLink OS): Sovereign SD-WAN, Network Governance & AI-NOC Platform

> 🌐 **Live Cloud NOC:** [https://v-monitor.vercel.app/](https://v-monitor.vercel.app/)  
> 🛡️ **AI Compliance Hub:** [https://ai-compliance-web-five.vercel.app/](https://ai-compliance-web-five.vercel.app/)  
> 🔑 **Demo Credentials:** `admin@intellilink.media` / `IntelliLink@2026`

## 1. Executive Overview

**V-Monitor (IntelliLink OS)** is a sovereign, carrier-grade **Software-Defined Wide Area Network (SD-WAN)**, **Autonomous Network Operations Center (A-NOC)**, and **Telecommunications Governance Platform (Intellilink NOG / ICG)**. Engineered for national regulatory authorities, Tier-1 telecom carriers, banking conglomerates, and sovereign defense enclaves, V-Monitor unites high-speed edge networking with strict regulatory compliance, lawful interception, and data sovereignty governance.

### Core Problems Solved:
1. **The Satellite Regulatory Dilemma:** Unregulated Low-Earth-Orbit (LEO) satellite links (e.g., Starlink) bypass national telecommunications jurisdictions. V-Monitor solves this by separating the **Transport Underlay** (satellite/cellular) from the **Governance Overlay** (licensed domestic ISP PoP breakout), guaranteeing national regulatory alignment.
2. **Data Sovereignty Violations & Border Leakage:** Prevents enterprise, government, and banking payloads from traversing foreign egress points, anchoring all traffic within sovereign national IP boundaries (e.g., AFRINIC/national address allocations).
3. **Proprietary Vendor Lock-In:** Replaces expensive, closed-box networking hardware (Cisco, Fortinet, Juniper) with an open, high-performance Linux kernel-level architecture (Netlink, eBPF, WireGuard).
4. **Outage Latency & Manual Triage:** Eliminates downtime with sub-second Bidirectional Forwarding Detection (BFD) and automated AI Root Cause Analysis (RCA) that mitigates circuit flaps in milliseconds.

---

## 2. High-Level Architecture & Governance Decoupling

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │            V-MONITOR REGULATORY & CONTROL PLANE GOVERNANCE             │
 └─────────────┬──────────────────────────┬─────────────────────────┬─────┘
               │                          │                         │
 ┌─────────────▼────────────┐ ┌───────────▼────────────┐ ┌──────────▼───────────┐
 │ Next.js 14 Web NOC UI    │ │ NestJS Core API Engine │ │ FastAPI AI Inference │
 │ Port 3000 (React Query)  │ │ Port 3001 (TypeORM/DB) │ │ Port 8100 (RCA & ML) │
 └─────────────┬────────────┘ └───────────┬────────────┘ └──────────┬───────────┘
               │                          │                         │
 ┌─────────────▼──────────────────────────▼─────────────────────────▼───────────┐
 │               SOVEREIGN GOVERNANCE & COMPLIANCE DATA PLANE                   │
 │     Lawful Intercept (ETSI) • Domestic PoP Anchoring • MySQL 8 • Redis       │
 └────────────────────────────────────────┬─────────────────────────────────────┘
                                          │
 ┌────────────────────────────────────────▼─────────────────────────────────────┐
 │                MULTI-ORBIT EDGE UNDERLAY & OVERLAY FABRIC                    │
 │  WireGuard Kernel Mesh  •  BFD Engine  •  Fiber DIA  •  Starlink  •  5G WAN  │
 └──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Capabilities

### 3.1. Sovereign Network Governance & Telecommunications Compliance
- **Underlay vs. Governance Overlay Separation:** Satellite and cellular underlays provide raw bandwidth, while the cryptographic WireGuard overlay forces all traffic to terminate inside licensed domestic carrier PoPs.
- **National Sovereign IP Localization:** Enforces domestic breakout using registered national IP pools, preventing foreign CGNAT IP assignment from masking traffic origins.
- **Regulatory Lawful Interception (ETSI / CALEA):** Enables lawful packet inspection, telecommunications tariff compliance, and security monitoring strictly at the sovereign PoP boundary.
- **Multi-Framework Governance Auditing:** Real-time compliance verification for SOC 2 Type II, ISO 27001, PCI-DSS 4.0, and sovereign cross-border data protection acts via the cloud AI Compliance Hub ([`ai-compliance-web-five.vercel.app`](https://ai-compliance-web-five.vercel.app/)).

### 3.2. Zero-Data Production Mode & Hardware Auto-Discovery
Unlike mock dashboards, V-Monitor operates in **Zero-Data Mode** by default. It discovers real network interfaces (`eno1`, `eth0`, `wg0`), maps live Layer-2 ARP neighbors, runs genuine ICMP echo diagnostics via `child_process.execFile`, and displays real hardware telemetry.

### 3.3. Sovereign Edge Mesh & Multi-WAN Bundling
- **Multi-Transport Aggregation:** Aggregates divergent physical transports (Dedicated Fiber DIA, Starlink LEO Satellite, Carrier Ethernet, and 5G cellular) into a single virtual tunnel.
- **Sub-Second BFD Probing:** Continuous Bidirectional Forwarding Detection (1000ms down to 50ms) tracks roundtrip latency, packet loss, and jitter in real time.
- **WireGuard Overlay:** Cryptographically isolated overlays powered by ChaCha20-Poly1305 and Curve25519 ECDH keypairs with autogenerated `/etc/wireguard/wg0.conf` profiles.

### 3.4. Autonomous AI-NOC & Self-Healing
- **Root Cause Analysis (RCA):** Automated diagnostic engine analyzes topological dependencies and telemetry to distinguish between physical fiber cuts, BGP route flaps, and carrier drops.
- **Automated Remediation Playbooks:**
  - `AUTO_REMEDIATE`: Flushes stale ARP bindings, steers BGP route weights over secondary paths, and restores connectivity.
  - `SWITCH_CARRIER`: Dynamically shifts traffic to backup Starlink LEO constellations during terrestrial fiber cuts.
  - `FLUSH_ARP_REBIND`: Clears stale kernel MAC tables directly on physical host interfaces.

### 3.5. 360° Operational Cockpit & Interactive Web Terminal
- **Site Cockpit Drawer:** Live inspection of active WAN uplinks, LAN subnets, connected nodes, appliance CPU/thermals, and 60-minute latency sparklines.
- **Remote VM Shell:** Web-based interactive terminal providing authenticated command execution (`uptime`, `ip a`, `ip route`, `ss -tulpn`, `systemctl status`) directly on managed remote nodes.

---

## 4. Key Target Personas & Use Cases

1. **National Telecom Regulators & Cyber Authorities:** Regulate enterprise LEO satellite deployments (Starlink) by mandating ICG compliance gateways to enforce lawful interception, security oversight, and domestic tax/tariff governance.
2. **Tier-1 Telecom Carriers & Domestic ISPs:** Monetize LEO satellite integration by providing domestic PoP termination, sovereign IP anchoring, and managed SLA failover to enterprise customers.
3. **Banking & Financial Institutions:** Guarantees sub-second failover for mission-critical SWIFT and POS transactions while strictly honoring financial data residency laws that forbid financial records from leaving national soil.
4. **Defense, Offshore & Government Enclaves:** Hybrid WAN bonding pairs low-earth orbit (Starlink LEO) with 5G cellular to maintain uninterrupted, tamper-proof connectivity for remote tactical, mining, and maritime assets.

---

## 5. Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend Web NOC** | Next.js 14, React 18, React Query (TanStack), Tailwind CSS, Lucide Icons |
| **Backend Core API** | NestJS, TypeScript, TypeORM, Swagger/OpenAPI, Linux Netlink, eBPF |
| **Database & Cache** | MySQL 8.0 / PostgreSQL, Redis Pub/Sub |
| **AI Inference Engine** | FastAPI, Python 3.12, PyTorch/scikit-learn, httpx |
| **Edge Networking** | WireGuard (`wireguard.ko`), Linux `iproute2`, BFD, ChaCha20-Poly1305 |
| **Governance Cloud** | Vercel Edge (`ai-compliance-web-five.vercel.app`), SOC 2, ISO 27001, ETSI |

---

## 6. Quick Start & Verification

```bash
# 1. Start all services (MySQL, API, Web NOC, AI Engine, Simulator)
./start-all.sh

# 2. Check service health and port status
./status.sh

# 3. Discover and onboard real physical network devices
./onboard-network.sh

# 4. Access Web NOC Dashboard
# Live Cloud NOC: https://v-monitor.vercel.app/
# Local URL: http://localhost:3000 (or http://<LAN_IP>:3000)
# Credentials: admin@intellilink.media / IntelliLink@2026
```

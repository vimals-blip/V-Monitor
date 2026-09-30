# V-Monitor (IntelliLink OS): Sovereign SD-WAN, Network Governance & AI-NOC Platform

> 🌐 **Live Cloud NOC:** [https://v-monitor.vercel.app/](https://v-monitor.vercel.app/)  
> 🛡️ **AI Compliance Hub:** [https://ai-compliance-web-five.vercel.app/](https://ai-compliance-web-five.vercel.app/)  
> 🔑 **Demo Credentials:** `admin@intellilink.media` / `IntelliLink@2026`

## 1. Executive Overview & Governance Mission

**V-Monitor (IntelliLink OS / Intellilink NOG)** is a sovereign, carrier-grade **Software-Defined Wide Area Network (SD-WAN)**, **Autonomous Network Operations Center (A-NOC)**, and **Telecommunications Governance Platform**. Engineered for regulators, telcos, banks, and defense enclaves, V-Monitor reconciles LEO satellite connectivity with national data sovereignty.

### The Governance Dilemma:
Foreign satellite links (e.g., Starlink) bypass domestic borders, violating data residency, lawful interception (ETSI/CALEA), and tax frameworks. V-Monitor decouples the **Transport Underlay** (satellite/5G) from the **Governance Overlay** (domestic ISP PoP breakout). Encrypted enterprise traffic terminates strictly through licensed domestic carrier gateways with sovereign IP address space localization (e.g., AFRINIC subnets).

---

## 2. High-Level Architecture

```
[ Next.js 14 NOC (:3000) ] ── [ NestJS API (:3001) ] ── [ FastAPI AI (:8100) ]
                                      │
   [ SOVEREIGN DATA PLANE: Domestic PoP Anchoring • ETSI Intercept • MySQL 8 ]
                                      │
   [ MULTI-ORBIT FABRIC: WireGuard Mesh • BFD Probing • Fiber • Starlink • 5G ]
```

---

## 3. Core Capabilities

1. **Sovereign Telecommunications Governance:**
   - **Underlay/Overlay Decoupling:** Enforces domestic breakout for satellite/cellular links at licensed domestic carrier PoPs.
   - **Lawful Interception & Auditing:** Provides ETSI/CALEA compliance and SOC 2, ISO 27001, and PCI-DSS 4.0 audits via the AI Compliance Hub.

2. **Zero-Data Production Engine & Real Hardware Telemetry:**
   - Discovers physical interfaces (`eno1`, `wg0`) and Layer-2 ARP neighbors, running genuine ICMP diagnostics with zero synthetic data.

3. **Multi-Orbit SD-WAN & Sub-Second Failover:**
   - Bundles Fiber, Starlink LEO, and 5G into a WireGuard mesh with continuous BFD probing (down to 50ms) for sub-second failover.

4. **Autonomous AI-NOC & Self-Healing:**
   - Automated Root Cause Analysis (RCA) diagnoses outages and executes playbooks (`AUTO_REMEDIATE`, `SWITCH_CARRIER`, `FLUSH_ARP_REBIND`).

5. **Operational Cockpit & Remote VM Terminal:**
   - Live WAN/LAN inspection, SLA sparklines, and authenticated VM shell (`uptime`, `ip a`, `systemctl`).

---

## 4. Key Personas & Use Cases

- **Telecom Regulators & Authorities:** Enforce lawful interception, data residency, and tax compliance across satellite links.
- **Tier-1 Telecom Carriers & ISPs:** Monetize LEO satellite underlays via domestic PoP termination, sovereign IP anchoring, and enterprise SLAs.
- **Banks & Financial Institutions:** Guarantee sub-second failover for SWIFT/POS traffic while upholding financial data residency laws.
- **Defense & Remote Operations:** Tamper-proof WAN bonding combining Starlink and 5G for remote enclaves.

---

## 5. Technology Stack & Quick Start

| Layer | Technologies |
| :--- | :--- |
| **Control Plane UI** | Next.js 14, React 18, TanStack Query, Tailwind CSS |
| **Core API & DB** | NestJS, TypeScript, TypeORM, MySQL 8, Redis, Netlink, eBPF |
| **AI Engine & Mesh** | FastAPI, Python 3.12, PyTorch, WireGuard, Linux BFD |
| **Cloud Deployments** | [v-monitor.vercel.app](https://v-monitor.vercel.app/) • [ai-compliance-web-five.vercel.app](https://ai-compliance-web-five.vercel.app/) |

```bash
./start-all.sh            # Launch MySQL, API (:3001), Web (:3000), AI (:8100)
./onboard-network.sh      # Discover and onboard physical network hardware
Credentials: admin@intellilink.media / IntelliLink@2026
```

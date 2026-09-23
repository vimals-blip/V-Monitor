# Intellilink Compliance Gateway (ICG) — Network Operations & Governance Platform (Intellilink NOG)

**Official Institutional Reference:** [Intellilink Gateway™ Executive Proof Summary](https://www.intellilink.media/docs/executive-proof-summary.html)  
**Architect:** Emmanuel Mukwesa, Founder & Architect, Intellilink Media LLC™ (USA)

---

## Overview

The **Intellilink Compliance Gateway (ICG)** platform enables enterprise Low-Earth-Orbit (LEO) satellite connectivity (e.g., Starlink, Eutelsat OneWeb) to seamlessly integrate into national telecommunications governance frameworks.

By separating the **Transport Underlay** (satellite connectivity) from the **Governance Overlay** (domestic ISP PoP anchoring), enterprises achieve 99.999% uptime and sub-second failover while regulators and licensed domestic telcos preserve lawful interception, domestic data sovereignty, and sovereign IP address space localization (AFRINIC `41.x.x.x/16`).

---

## Key Institutional Documentation

- **[Executive Proof Platform Manual](./docs/EXECUTIVE_PROOF_PLATFORM_MANUAL.md):** Architectural alignment with the official Intellilink Media executive documentation, stakeholder workflows for regulators, ISPs, and enterprise clients, and the live demonstration script.
- **[Client Operational Guide & Runbook](./docs/CLIENT_OPERATIONAL_GUIDE.md):** Complete operational manual for NOC operators, network administrators, API reference, credentials, and troubleshooting runbooks.

---

## Core Platform Subsystems

| Module | Route | Operational Purpose |
|---|---|---|
| **Multi-Tenancy** | `/tenants`, `/sites`, `/gateways` | Isolated VRF domains, enterprise sites, and edge ICG Agent nodes. |
| **WAN & Benchmarking** | `/wan-links` | Real Linux kernel ICMP speed/latency benchmarking across Fiber, Starlink, and Cellular circuits. |
| **Core PoPs & Overlays** | `/pops`, `/aggregators`, `/tunnels` | Domestic PoP anchoring, WireGuard aggregation, and crypto verification. |
| **Sovereign Routing** | `/routing`, `/nat`, `/firewall` | Linux FIB route inspection, domestic address localization, and stateful packet filtering. |
| **Governance Policies** | `/policies`, `/automation` | SLA traffic steering, sub-second failover, and event-driven automation rules. |
| **AIOps & Incidents** | `/ai-assistant`, `/incidents`, `/monitoring` | Conversational NOC assistant, automated Root Cause Analysis (RCA), and rolling z-score anomaly detection. |

---

## Quick Access & Credentials

- **Web Dashboard:** `http://localhost:3000`
- **Control-Plane API:** `http://localhost:3001/api/v1`
- **AIOps Engine:** `http://localhost:8100`
- **Default NOC Administrator:** `admin@intellilink.com`
- **Password:** `IntelliLink@2026`

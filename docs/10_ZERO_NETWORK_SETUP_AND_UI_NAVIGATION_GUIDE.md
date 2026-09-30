# IntelliLink OS (V-Monitor): Zero-Network Setup & UI Navigation Guide

**Document ID:** `DOC-10-ZERO-SETUP-NAV`  
**Classification:** Technical Operations & Field Demonstration Manual  
**Target Audience:** Network Architects, NOC Operators, Technical Sales Engineers, System Evaluators  
**Applies To:** IntelliLink OS / V-Monitor Web NOC Interface (`http://localhost:3000` / `http://192.168.2.212:3000`)

---

## 1. Executive Concept: Starting from "Zero Network"

In enterprise IT and carrier telecommunications, **"Zero Network"** describes a greenfield deployment where no SD-WAN overlay, no cryptographic tunnels, and no site definitions exist yet.

```
                    TRADITIONAL CARRIER SETUP (3 - 6 MONTHS)
  [Ship Proprietary Routers] ──► [On-Site Field Engineers] ──► [Complex CLI Scripting] ──► [Manual Routing]
                                            VS
                     INTELLILINK ZERO-TOUCH SETUP (< 5 MINUTES)
  [Open /setup Wizard] ──► [Auto-Detect Linux Kernel] ──► [1-Click ARP Sweep] ──► [1-Click Full Bootstrap]
```

### The 3 Core Tenets of V-Monitor Zero-Touch Provisioning:
1. **Zero Synthetic/Mock Data:** All interface telemetry, IP addresses, and MAC addresses are sampled directly from the Linux host kernel (`/sys/class/net/eno1`, `/proc/net/arp`, and `ip route`).
2. **Deterministic Cryptographic Mesh:** Every enrolled gateway generates its own Curve25519 keypair and connects over encrypted WireGuard overlays (`UDP 51820`).
3. **Automated Subnet & Route Anchoring:** Automatically establishes sovereign in-country breakout routes without overlapping IP conflicts.

---

## 2. Master UI Layout Architecture

When you log into **V-Monitor** (`admin@intellilink.media` / `IntelliLink@2026`), the interface is divided into 3 primary zones:

```
+----------------------------------------------------------------------------------------------------+
| [LOGO] IntelliLink OS    [Live Subnet: 192.168.0.0/20]    [Tenant: Enterprise Prod]    [Admin Badge]| (Top Header)
+-------------------+--------------------------------------------------------------------------------+
|                   |                                                                                |
|   SIDEBAR MENU    |                                MAIN CONTENT AREA                               |
|   (26 Modules in  |                                                                                |
|    5 Groups)      |  • /setup         : 4-Step Zero-Touch Onboarding Wizard                        |
|                   |  • /dashboard     : Single-Pane-of-Glass NOC Operations Center                 |
|   • Control Plane |  • /network-map   : Interactive Geo-Located Fiber vs Satellite Map             |
|   • Connectivity  |  • /gateways      : Physical Router Fleet & WireGuard Keys                     |
|   • Governance    |  • /wan-links     : Circuit Speed, Loss & RTT Latency Benchmarks               |
|   • Operations    |  • /ai-assistant  : Conversational AIOps & Root Cause Analysis (RCA)           |
|   • System        |                                                                                |
|                   |                                                                                |
+-------------------+--------------------------------------------------------------------------------+
```

---

## 3. Deep Dive: Initial Setup & Network Onboarding (`/setup`)

The **Initial Setup** screen (`http://localhost:3000/setup`) is the first item on the sidebar. It guides operators step-by-step from zero infrastructure to a fully synchronized network fabric.

### Step 1: Organization Profile & Target Physical Systems

```
+----------------------------------------------------------------------------------------------------+
| Step 1: Organization Profile & Target Physical Systems                                              |
| Enter your client tenant name and specify company workstation/gateway IPs you want to monitor.      |
+----------------------------------------------------------------------------------------------------+
|  [Left Column: Form Inputs]                     |  [Right Column: Kernel Hardware Detection Card]  |
|                                                 |                                                  |
|  Client Tenant / Organization Name:             |  HOST INTERFACE ENVIRONMENT     [ACTIVE INTERFACE]
|  [ Intellilink Media Enterprise Production   ]  |                                                  |
|                                                 |  Physical Interface:  eno1                       |
|  Operational Contact Email:                     |  Host IPv4 Address:   192.168.2.212/20           |
|  [ operations@intellilink.media              ]  |  Default Gateway:     192.168.0.50 (Cisco Core)  |
|                                                 |  Hardware MAC:        ec:b1:d7:5e:d0:3c          |
|  Target Network Endpoints / Node IPs:           |  Link MTU:            1500 Bytes                 |
|  [ e.g. 10.0.0.1, 192.168.1.100 (Optional)   ]  |                                                  |
|                                                 |  Direct interface telemetry active via           |
|  (Leave blank to auto-discover local subnet)    |  /sys/class/net/eno1 and kernel neighbor table.  |
+----------------------------------------------------------------------------------------------------+
|                                    [Bottom Right Button: Scan Subnet & Target Nodes ->]             |
+----------------------------------------------------------------------------------------------------+
```

#### Where to Look & What It Means:
1. **Client Tenant Name Input (Top Left):** The name of the enterprise or subsidiary you are onboarding.
2. **Host Interface Environment Card (Right Side):**
   - **Physical Interface (`eno1`):** Shows the real network card powering the control plane.
   - **Host IPv4 Address (`192.168.2.212/20`):** The local address allocated to this server.
   - **Default Gateway (`192.168.0.50`):** The upstream Cisco/core router providing Internet backhaul.
   - **Hardware MAC (`ec:b1:d7:...`):** Physical IEEE hardware identity.
3. **The Action Button (Bottom Right):** Click **`Scan Subnet & Target Nodes →`** to trigger the ARP sweep.

---

### Step 2: Interface & Subnet Discovery

```
+----------------------------------------------------------------------------------------------------+
| Step 2: Subnet Discovery & Node Probing                                                             |
| Discovered 89 network nodes from Linux neighbor tables, ARP cache, and target list.                 |
+----------------------------------------------------------------------------------------------------+
|  DISCOVERED PHYSICAL APPLIANCES & WORKSTATIONS                                                     |
|  +--------------------+-------------------+------------------------+------------------+---------+  |
|  | IP Address         | MAC Address       | Vendor / OUI           | Status           | Type    |  |
|  +--------------------+-------------------+------------------------+------------------+---------+  |
|  | 192.168.0.50       | 00:00:0c:...      | Cisco Systems          | REACHABLE (0.2ms)| Router  |  |
|  | 192.168.2.100      | 70:85:c2:...      | Hewlett Packard Ent.   | REACHABLE (0.4ms)| Server  |  |
|  | 192.168.2.145      | 48:21:0b:...      | Intel Corporate        | REACHABLE (0.3ms)| Gateway |  |
|  +--------------------+-------------------+------------------------+------------------+---------+  |
+----------------------------------------------------------------------------------------------------+
|                                    [Bottom Right Button: Proceed to Fabric Review ->]               |
+----------------------------------------------------------------------------------------------------+
```

#### What It Shows:
- Scans the Linux ARP table and ICMP neighbor entries.
- Translates hardware MAC addresses into manufacturer brand names (Cisco, HP, Intel, Realtek).
- Confirms reachability without manual IP entry.
- Click **`Proceed to Fabric Review →`** to review the cryptographic fabric before provisioning.

---

### Step 3: Fabric & Governance Review (Full Live Bootstrap)

```
+----------------------------------------------------------------------------------------------------+
| Step 3: Zero-Touch Provisioning & Policy Generation                                                |
| Commit enterprise topology, generate WireGuard cryptographic mesh, and link domestic PoPs.         |
+----------------------------------------------------------------------------------------------------+
|  • Domestic PoP Anchor:         Enterprise Core PoP (192.168.0.50 - Cisco Carrier Ethernet)       |
|  • Autonomous SD-WAN Overlays:  15 Point-to-Point WireGuard Peering Tunnels (UDP 51820)            |
|  • Kernel Routing Anchors:      0.0.0.0/0 via 192.168.0.50 | 192.168.0.0/20 Direct FIB Injection   |
|  • Sovereign Governance:        AFRINIC IP localization & Lawful Interception mirror port active   |
+----------------------------------------------------------------------------------------------------+
|                                    [Bottom Right Button: Execute Full Live Bootstrap]               |
+----------------------------------------------------------------------------------------------------+
```

#### What It Does:
- Clicking **`Execute Full Live Bootstrap`** sends an automated provisioning payload to `/api/v1/network-discovery/full-live-bootstrap`.
- In < 2 seconds, it writes all sites, gateways, tunnels, IPAM pools, and firewall policies to MySQL.
- Advances to Step 4.

---

### Step 4: Deployment Summary & Edge Activation

```
+----------------------------------------------------------------------------------------------------+
| Step 4: Network Fabric Provisioned & Active                                                        |
| Enterprise network infrastructure is live and synchronizing telemetry with the control plane.     |
+----------------------------------------------------------------------------------------------------+
|  [GREEN CHECKMARK] 100% OPERATIONAL                                                                |
|  Tenant: Acme Logistics | Gateways: 42 Enrolled | PoPs: 1 Active | Tunnels: 15 UP                 |
|                                                                                                    |
|  CONNECT REMOTE HARDWARE / STARLINK NODES (One-Command Installer):                                 |
|  curl -sSL http://192.168.2.212:3001/api/v1/network-discovery/agent/install.sh | sudo bash        |
+----------------------------------------------------------------------------------------------------+
|                                    [Button: Open NOC Mission Control Dashboard ->]                 |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. UI Location Map: Where to Find Everything in the Sidebar

All 26 platform modules are organized into 5 intuitive sidebar groups:

```
[Control Plane]
├── Initial Setup       -> /setup         (4-Step Zero-Touch Onboarding Wizard)
├── Overview NOC        -> /dashboard     (Master single-pane-of-glass NOC executive center)
├── Customer Portal     -> /portal        (Client-facing read-only SLA & usage dashboard)
├── Network Map         -> /network-map   (Geo-located world map of fiber & satellite links)
├── Tenants             -> /tenants       (Multi-tenant cryptographic VRF isolation)
├── Sites               -> /sites         (Physical branch locations, data centers, campuses)
├── PoPs                -> /pops          (Domestic carrier Points-of-Presence & aggregators)
└── Aggregators         -> /aggregators   (WireGuard tunnel concentrators & VPN hubs)

[Connectivity & Edge]
├── Gateways            -> /gateways      (CPE routers, Starlink terminals, key rotation)
├── WAN Links           -> /wan-links     (Fiber, Satellite, Cellular RTT/Loss benchmarks)
└── Tunnels             -> /tunnels       (WireGuard encrypted overlays & crypto verification)

[Governance & Security]
├── Routing             -> /routing       (Linux FIB routes, default gateways, BGP tables)
├── Firewall            -> /firewall      (Stateful packet filtering & port rules)
├── NAT                 -> /nat           (SNAT masquerade, Port forwarding, VIP mappings)
├── Policies            -> /policies      (SLA traffic steering & sub-second BFD failover)
└── AI Compliance       -> /ai-compliance (Telecom regulatory audit, data residency checks)

[Operations & AI]
├── Live Monitoring     -> /monitoring    (Sub-second RX/TX throughput & kernel jitter)
├── Live Diagnostics    -> /diagnostics   (Real OS ping, DNS resolution, TCP traceroute)
├── Alerts              -> /alerts        (Threshold triggers, link flaps, latency warnings)
├── Incidents           -> /incidents     (Automated ticket tracking & remediation playbooks)
├── Automation          -> /automation    (Event-driven self-healing rules & workflows)
└── AI Assistant        -> /ai-assistant  (Conversational NOC assistant & Root Cause Analysis)

[System & Reports]
├── Reports             -> /reports       (PDF/CSV executive SLA compliance reports)
├── Audit Logs          -> /audit         (Immutable tamper-evident administrative logs)
├── System Health       -> /system-health (NestJS, MySQL, FastAPI CPU/RAM telemetry)
└── Settings            -> /settings      (API tokens, webhook URLs, notification channels)
```

---

## 5. Summary Cheat Sheet for Presenters & Evaluators

| If you want to show... | Click this in the sidebar | Key talking point |
| :--- | :--- | :--- |
| **How easy it is to start from scratch** | `Initial Setup` (`/setup`) | *"In under 3 minutes, our wizard scans your physical network card, runs an ARP sweep, and provisions an entire SD-WAN mesh."* |
| **Global network health & executive stats** | `Overview NOC` (`/dashboard`) | *"Single pane of glass tracking real-time bandwidth, SLA compliance, and zero packet-drop failover."* |
| **Fiber vs Starlink satellite visual map** | `Network Map` (`/network-map`) | *"Green lines represent terrestrial fiber; gold lines show active LEO satellite backups."* |
| **Physical router hardware & key rotation** | `Gateways` (`/gateways`) | *"Zero-touch key rotation generates fresh Curve25519 WireGuard keypairs on edge devices with one click."* |
| **Live circuit latency & speed benchmark** | `WAN Links` (`/wan-links`) | *"Live ICMP kernel probes benchmark Starlink satellite vs terrestrial fiber every 5 seconds."* |
| **Self-healing AI & Root Cause Analysis** | `AI Assistant` (`/ai-assistant`) | *"Integrated AI assistant isolates link degradation before customer users notice a dropped call."* |

---

## 6. One-Click Command Line Tools

All operations can also be driven from the terminal via automated shell scripts located in the root repository:

```bash
# Start all background services with health checks
./start-all.sh

# View live service status, ports, and access URLs
./status.sh

# Run zero-touch network onboarding directly from CLI
./onboard-network.sh "Company Network Name"

# Cleanly stop all running services
./stop-all.sh
```

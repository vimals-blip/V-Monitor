# IntelliLink OS: Target Architecture, Capability Audit & UI Feature Mapping

---

## 1. Executive Summary & Full Architectural Scorecard

This document provides a comprehensive operational audit of the IntelliLink OS / V-Monitor platform against the target carrier SD-WAN architecture diagram. Every single component in the diagram—including the **NOG UI, API/WebSocket layer, Backend, Monitoring Engine (SNMP, Syslog, NetFlow, Telemetry), Automation Engine (SSH, NETCONF, Scripts), Governance, AI/Rules Engine, Edge Hardware Connectors (Cisco, MikroTik, Linux/Firewall), and Multi-WAN Transports (Fiber, 5G, Starlink)**—is now **100% implemented, verified, and accessible directly in the Web NOC interface**.

```
                    ┌─────────────────────────────────────────┐
                    │                 NOG UI                  │  🟢 100% OPERATIONAL
                    │  Dashboard / Incidents / SLA / Audit    │  Next.js 14 (Port 3000)
                    │  Devices / Topology / Diagnostics / AI  │  24 Dedicated Navigation Tabs
                    └────────────────────┬────────────────────┘
                                         │
                                  API / WebSocket                🟢 100% OPERATIONAL
                                         │                       NestJS 10 REST & EventsGateway
                    ┌────────────────────▼────────────────────┐
                    │               NOG Backend               │  🟢 100% OPERATIONAL
                    │  Node.js (NestJS 10) / MySQL 8.0 DB     │  FastAPI Python (Port 8100)
                    └────────────────────┬────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          ▼                              ▼                              ▼
    Monitoring Engine            Automation Engine                 Governance
    🟢 Live Kernel Telemetry     🟢 Edge Router Agent Script      🟢 Immutable Audit Logs
    🟢 Sub-Second BFD Prober     🟢 Kernel FIB Route Swapping     🟢 Dynamic SLA Compliance
    🟢 ARP Neighbor Discovery    🟢 SSH Remote CLI Driver         🟢 Multi-Tenant Policies
    🟢 SNMPv2c/v3 MIB Poller     🟢 RFC 6241 NETCONF RPC          🟢 Regulatory Reports
    🟢 SNMP Trap Receiver (1162) 🟢 Golden Config Generator
    🟢 RFC 5424 Syslog (5140)
    🟢 NetFlow v5/v9 & IPFIX (2055)
          │                              │                              │
          └──────────────────────────────┼──────────────────────────────┘
                                         │
                                 AI / Rules Engine                 🟢 100% OPERATIONAL
                                         │                         FastAPI Predictive Model
                                         │                         5 Carrier Automation Workflows
       ┌─────────────────────────────────┼─────────────────────────────────┐
       │                                 │                                 │
       ▼                                 ▼                                 ▼
    Cisco Router                      MikroTik Router                   Firewall / Cloud
    🟢 Universal Edge Agent           🟢 Universal Edge Agent           🟢 WireGuard Multi-WAN Tunnels
       (via IOS-XE GuestShell)           (via RouterOS v7 Container)    🟢 Linux iptables / NAT Rules
    🟢 Golden Config Generator        🟢 Golden Config Generator        🟢 Multi-Tenant IPAM
    🟢 Remote SSH Driver (Port 22)    🟢 Remote SSH Driver (Port 22)
       │                                 │                                 │
       └─────────────────────────────────┼─────────────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
                  Fiber                 5G                 Starlink
              🟢 Primary WAN       🟢 Failover WAN      🟢 LEO Satellite Edge
              (eno1 Interface)     (Dynamic Cellular)   (Bypass Mode + 192.168.100.1
                                                         + CGNAT WireGuard Mesh)
```

---

## 2. Complete Architecture-to-UI Tab Mapping Matrix

| Architecture Block | Component | Status | Sidebar Navigation Group | UI Tab Name | URL Path | Key Capabilities & Features Visible in this Tab |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **NOG UI** | **Executive NOC Dashboard** | 🟢 Live | Control Plane | **Overview NOC** | `/dashboard` | High-level topology overview, real-time total bandwidth graphs, aggregate circuit health, active alarm count, and recent incidents feed. |
| | **Customer Portal** | 🟢 Live | Control Plane | **Customer Portal** | `/portal` | End-customer tenant view, bandwidth consumption metrics, branch uptime, and SLA scorecards. |
| | **Network Map** | 🟢 Live | Control Plane | **Network Map** | `/network-map` | Interactive global geospatial map visualizing multi-orbit branches, domestic PoPs, Starlink links, and active underlay paths. |
| | **Tenants & Orgs** | 🟢 Live | Control Plane | **Tenants** | `/tenants` | Multi-tenant sovereign organization segregation, company profiles, and tenant-scoped resource limits. |
| | **Sites** | 🟢 Live | Control Plane | **Sites** | `/sites` | Enterprise branch inventory, physical GPS locations, primary contact details, and assigned PoPs. |
| | **Domestic PoPs** | 🟢 Live | Control Plane | **PoPs** | `/pops` | Sovereign telecom in-country landing points, edge aggregators, domestic breakout routers, and inter-PoP backhauls. |
| | **Aggregators** | 🟢 Live | Control Plane | **Aggregators** | `/aggregators` | High-throughput core concentrators clustering branch WireGuard tunnels. |
| **Edge & Devices** | **Gateways / Edge Routers** | 🟢 Live | Connectivity & Edge | **Gateways** | `/gateways` | Inventory of all discovered Cisco, MikroTik, and Linux edge boxes, CPU/memory loads, firmware versions, and registration tokens. |
| | **WAN Links** | 🟢 Live | Connectivity & Edge | **WAN Links** | `/wan-links` | Live circuit-by-circuit telemetry: Terrestrial Fiber (`eno1`), 5G Cellular, and Starlink LEO; real RX/TX throughput, loss %, and BFD latency. |
| | **Tunnels** | 🟢 Live | Connectivity & Edge | **Tunnels** | `/tunnels` | WireGuard cryptographic mesh overlays, peer public keys, endpoint IPs, handshake keepalives, and MTU optimization. |
| **Monitoring Engine**| **Live Telemetry** | 🟢 Live | Operations & AI | **Live Monitoring** | `/monitoring` | Microsecond-accurate time-series charts of Linux kernel sysfs counters, live interface drops, errors, and real-time streaming bandwidth. |
| | **RFC 5424 Syslog Daemon** | 🟢 Live | Operations & AI | **Live Monitoring** > **Syslog Daemon** | `/monitoring` | Live UDP :5140 ingestion daemon parsing PRI, Facility, Severity (Critical, Error, Warning, Notice, Info), Tag, Hostname; live log stream and 1-click simulator. |
| | **NetFlow / IPFIX Flow Collector** | 🟢 Live | Operations & AI | **Live Monitoring** > **NetFlow / IPFIX** | `/monitoring` | Live UDP :2055 flow collector; displays Top Talkers (Source IPs by volume), Application Classification (WireGuard, HTTPS, Starlink-Telemetry, VoIP-SIP, BGP, DNS). |
| | **SNMPv2c/v3 MIB Poller** | 🟢 Live | Operations & AI | **Live Diagnostics** > **SNMP MIB & Traps** | `/diagnostics` | Interactive tool to poll OIDs (`1.3.6.1.2.1`) across Cisco, MikroTik, and Linux devices. Extracts `sysName`, `sysDescr`, `sysUpTime`, and interface counters. |
| | **SNMP Trap Receiver** | 🟢 Live | Operations & AI | **Live Diagnostics** > **SNMP MIB & Traps** | `/diagnostics` | UDP :1162 background trap listener ingesting enterprise traps (linkDown, linkUp, satelliteObstructionWarning) with 1-click demonstration simulation. |
| | **Diagnostics (ARP / Ping)**| 🟢 Live | Operations & AI | **Live Diagnostics** | `/diagnostics` | Interactive tool to run live ICMP pings, ARP scans, traceroutes, interface packet inspections, and Starlink `192.168.100.1` dish checks. |
| | **Alerts & Alarms** | 🟢 Live | Operations & AI | **Alerts** | `/alerts` | Sub-second alert feed triggering on carrier link loss, BFD threshold violations (>60ms), and packet loss events (>1.5%). |
| | **Incidents Triage** | 🟢 Live | Operations & AI | **Incidents** | `/incidents` | Incident lifecycle management (P1 Critical through P4 Minor), SLA breach countdown timers, operator assignment, and resolution notes. |
| **Automation Engine**| **Autonomous Rules** | 🟢 Live | Operations & AI | **Automation** > **Active Policies** | `/automation` | Execution log and status of the 5 carrier-grade workflows: Automated WAN Path Steering, ZTP Engine, Flap Damping, SecOps Isolation, and GitOps Drift. |
| | **Router Golden Config Generator** | 🟢 Live | Operations & AI | **Automation** > **Router Automation** | `/automation` | Produces production-ready configuration syntax for Cisco IOS-XE, MikroTik RouterOS v7, and Linux WireGuard appliances with Starlink bypass. |
| | **Remote SSH CLI Driver** | 🟢 Live | Operations & AI | **Automation** > **Router Automation** | `/automation` | Connects via SSH to Cisco, MikroTik, or Linux edge routers and executes live CLI commands (`show ip interface brief`, `/interface print`). |
| | **RFC 6241 NETCONF RPC** | 🟢 Live | Operations & AI | **Automation** > **Router Automation** | `/automation` | Formulates and dispatches NETCONF XML RPC payloads (`<get-config>`, `<edit-config>`) to router management ports. |
| | **Edge Agent Installer** | 🟢 Live | Control Plane | **Initial Setup** | `/setup` | One-command shell installer script generator (`curl -sSL http://.../agent/install.sh | bash`) for Cisco GuestShell, MikroTik, and Linux edge routers. |
| **Governance & Security**| **Firewall Rules** | 🟢 Live | Governance & Security | **Firewall** | `/firewall` | State-aware ingress/egress security policies, Layer 3/4 drop rules, and zero-trust microsegmentation. |
| | **NAT Policies** | 🟢 Live | Governance & Security | **NAT** | `/nat` | Source NAT (SNAT), Port Forwarding (DNAT), and 1:1 NAT mapping for corporate subnets. |
| | **Routing Engine** | 🟢 Live | Governance & Security | **Routing** | `/routing` | Static route tables, policy-based routing (PBR), VRF segmentation, and BGP/OSPF peer statuses. |
| | **Enterprise Policies** | 🟢 Live | Governance & Security | **Policies** | `/policies` | Traffic shaping profiles, QoS priority tagging (VoIP DSCP EF 46 vs Bulk Traffic), and bandwidth limits. |
| | **Audit Trail** | 🟢 Live | System & Reports | **Audit Logs** | `/audit` | SOC-2 / ISO 27001 compliant immutable event stream tracking every operator action, route failover, rule edit, and login. |
| | **SLA Engine** | 🟢 Live | System & Reports | **Reports** | `/reports` | Carrier SLA tracking (99.99% availability, latency thresholds, packet loss guarantees) and breach financial penalty calculators. |
| | **Regulatory Reports** | 🟢 Live | System & Reports | **Reports** | `/reports` | Sovereign compliance reports detailing in-country PoP traffic anchoring and lawful interception readiness. |
| **AI Engine** | **Predictive Steering** | 🟢 Live | Operations & AI | **AI Assistant** | `/ai-assistant` | AI conversational diagnostic assistant and predictive link quality optimizer driven by the FastAPI Python service (Port 8100). |
| **System Ops** | **System Health** | 🟢 Live | System & Reports | **System Health** | `/system-health` | Host CPU, RAM, disk, MySQL connection pool, and background poller status. |
| | **Settings** | 🟢 Live | System & Reports | **Settings** | `/settings` | System-wide credentials, API keys, dark/light theme toggle, and notification webhooks. |

---

## 3. Deep Dive into Hardware Connectors & Edge Abstraction

```
                   ┌──────────────────────────────────────────────┐
                   │          IntelliLink Edge Agent              │
                   │    /usr/local/bin/intellilink-agent          │
                   │   Auto-Registration • Telemetry • Heartbeat  │
                   └──────────────────────┬───────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
    Cisco Router (IOS-XE)          MikroTik Router              Linux Edge Appliance
    Runs inside native             Runs inside RouterOS v7      Runs as a standard
    IOS-XE GuestShell              Container feature            systemd background service
    (CentOS / Python environment)  (Docker-compatible isolated) (/etc/systemd/system/...)
```

### 3.1 Cisco Routers (Catalyst 8000, ISR 4000, ASR 1000)
- **Operational Mode 1 (GuestShell Container Agent):**
  - Technicians enable GuestShell and execute the 1-command installer from the `/setup` tab:
    ```bash
    guestshell enable
    guestshell run bash -c "curl -sSL http://<MONITOR_IP>:3001/api/v1/network-discovery/agent/install.sh | bash"
    ```
- **Operational Mode 2 (Golden Config Generator):**
  - In the **Automation** tab (`/automation` > **Router Automation**), select **Cisco IOS-XE** to generate complete IP SLA, BFD, and Starlink bypass routing configurations.
- **Operational Mode 3 (Remote SSH CLI Driver):**
  - In `/automation` > **Router Automation**, operators can dispatch live Cisco CLI commands (`show ip interface brief`, `show version`, `show ip route`) via SSH port 22 directly from the Web NOC.

### 3.2 MikroTik Routers (RouterOS v7)
- **Operational Mode 1 (RouterOS Container Agent):**
  - Runs the edge container image inside MikroTik RouterOS v7.
- **Operational Mode 2 (Golden Config Generator):**
  - Generates `/interface wireguard`, `/ip route`, and `/ip firewall mangle` scripts formatted specifically for RouterOS v7.
- **Operational Mode 3 (Remote SSH CLI Driver):**
  - Dispatches MikroTik CLI commands (`/interface print`, `/ip route print`, `/system resource print`).

### 3.3 Firewalls & Sovereign PoP Aggregators
- **Operational Mode (Native WireGuard & Linux Kernel):**
  - Aggregators and firewalls run the full Linux networking stack with in-tree WireGuard (`wg0`).
  - Managed directly via the **Firewall** (`/firewall`), **NAT** (`/nat`), and **Tunnels** (`/tunnels`) tabs.

---

## 4. Physical WAN Transports (Underlays)

| Transport | UI Tab Location | Metrics Tracked | Failover Role |
| :--- | :--- | :--- | :--- |
| **Terrestrial Fiber** | **WAN Links** (`/wan-links`) | Throughput, BFD RTT, packet loss, interface byte counters (`eno1`). | **Primary Circuit:** Low latency (10–25ms), high throughput. |
| **5G / Cellular** | **WAN Links** (`/wan-links`) | Signal strength (RSRP/RSRQ), carrier latency, usage cap tracking. | **Secondary Circuit:** Low cost, immediate hot-standby fallback. |
| **Starlink LEO Satellite** | **WAN Links** (`/wan-links`) & **Live Diagnostics** (`/diagnostics`) | Dish obstruction %, SNR, azimuth, tilt, latency (25–45ms), CGNAT traversal status. | **Mission-Critical Edge:** <24hr rapid site deployment, bypassing carrier lines; outbound WireGuard tunnel prevents inbound CGNAT reachability issues. |

---

## 5. Client Demonstration Runbook for New Capabilities

When pitching or demonstrating the platform to enterprise clients:

1. **Demonstrate Syslog Streaming (RFC 5424):**
   - Navigate to **Live Monitoring** (`/monitoring`) and click the **Syslog Daemon (RFC 5424)** tab.
   - Point out the active UDP `:5140` daemon listening status.
   - Click **Simulate Syslog Event** to watch an RFC-formatted Cisco BGP drop or Starlink satellite handover message appear instantaneously with color-coded severity badges.
2. **Demonstrate NetFlow / IPFIX Top Talkers:**
   - In **Live Monitoring** (`/monitoring`), click the **NetFlow / IPFIX Flow Collector** tab.
   - Show the live Top Talkers table, total bandwidth volume, and application classification breakdown (WireGuard Mesh, HTTPS, Starlink Telemetry, VoIP-SIP, DNS).
   - Click **Simulate Flow Packet** to show dynamic real-time graph recalculation.
3. **Demonstrate SNMP MIB Poller & Trap Ingestion:**
   - Navigate to **Live Diagnostics** (`/diagnostics`) and click the **SNMP MIB & Traps** tab.
   - Enter `192.168.0.50`, community `public`, and click **Execute MIB Poll**. Show the parsed `sysName`, `sysDescr`, and physical interface Octets.
   - Under **Ingested SNMP Traps**, click **Simulate linkDown Trap** to show immediate trap capture and logging.
4. **Demonstrate Cisco & MikroTik Router Automation:**
   - Navigate to **Automation** (`/automation`) and click **Router Automation & Golden Configs**.
   - Select **Cisco IOS-XE** or **MikroTik RouterOS**, enter site parameters, and click **Generate Production Golden Config** to reveal a complete multi-WAN Starlink bypass deployment script.
   - Switch to the **Remote SSH CLI Driver** tab and click **Execute via SSH** to show interactive command execution.

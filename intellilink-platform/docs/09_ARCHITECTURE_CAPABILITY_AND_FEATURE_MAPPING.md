# IntelliLink OS: Target Architecture, Capability Audit & UI Feature Mapping

---

## 1. Executive Summary & Architectural Scorecard

This document provides a comprehensive audit of the IntelliLink OS / V-Monitor platform against the target carrier SD-WAN architecture diagram. It identifies the operational status of every architectural block, the underlying microservice technologies, and the **exact UI navigation tab and URL path** where each feature can be accessed in the Mission Control Web NOC.

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
    🟢 ARP Neighbor Discovery    🟡 SSH / Remote Execution        🟢 Multi-Tenant Policies
    🟡 SNMP Port Check (UDP 161) 🔴 NETCONF / RESTCONF            🟢 Regulatory Reports
    🔴 Syslog Daemon (UDP 514)
    🔴 NetFlow / IPFIX (UDP 2055)
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
    🟡 Universal Edge Agent           🟡 Universal Edge Agent           🟢 WireGuard Multi-WAN Tunnels
       (via IOS-XE GuestShell)           (via RouterOS v7 Container)    🟢 Linux iptables / NAT Rules
    🔴 Native IOS-XE CLI / NETCONF    🔴 Native RouterOS API            🟢 Multi-Tenant IPAM
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

| Architecture Block | Component | Status | Sidebar Navigation Group | UI Tab Name | URL Path | Key Capabilities Visible in this Tab |
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
| | **Diagnostics (ARP / Ping)**| 🟢 Live | Operations & AI | **Live Diagnostics** | `/diagnostics` | Interactive tool to run live ICMP pings, ARP scans, traceroutes, interface packet inspections, and Starlink `192.168.100.1` dish checks. |
| | **Alerts & Alarms** | 🟢 Live | Operations & AI | **Alerts** | `/alerts` | Sub-second alert feed triggering on carrier link loss, BFD threshold violations (>60ms), and packet loss events (>1.5%). |
| | **Incidents Triage** | 🟢 Live | Operations & AI | **Incidents** | `/incidents` | Incident lifecycle management (P1 Critical through P4 Minor), SLA breach countdown timers, operator assignment, and resolution notes. |
| | **SNMP Poller** | 🟡 Partial | Operations & AI | **Live Diagnostics** | `/diagnostics` | Port scanning detects UDP 161; full MIB/OID polling engine is slated for next phase. |
| | **Syslog (RFC 5424)** | 🔴 Roadmap | Operations & AI | **Live Diagnostics** | `/diagnostics` | Currently captured via journald/backend logs; standalone RFC-5424 UDP/TCP 514 syslog ingest service is in roadmap. |
| | **NetFlow / IPFIX** | 🔴 Roadmap | Operations & AI | **Live Monitoring** | `/monitoring` | Interface bandwidth is tracked via kernel byte counters; deep per-flow IPFIX collector is in roadmap. |
| **Automation Engine**| **Autonomous Rules** | 🟢 Live | Operations & AI | **Automation** | `/automation` | Execution log and status of the 5 carrier-grade workflows: Automated WAN Path Steering, ZTP Engine, Flap Damping, SecOps Isolation, and GitOps Drift. |
| | **Edge Agent Installer** | 🟢 Live | Control Plane | **Initial Setup** | `/setup` | One-command shell installer script generator (`curl -sSL http://.../agent/install.sh | bash`) for Cisco GuestShell, MikroTik, and Linux edge routers. |
| | **SSH / Remote Config** | 🟡 Partial | Operations & AI | **Automation** | `/automation` | Rule execution dispatches local Linux FIB swaps and remote API registrations. Remote SSH command push is in-flight. |
| | **NETCONF / RESTCONF** | 🔴 Roadmap | Operations & AI | **Automation** | `/automation` | YANG schema automation for native Cisco IOS-XE and Juniper Junos CLI push. |
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
- **Current Operational Mode:** **GuestShell / Agent Mode (Live)**
  - Modern Cisco IOS-XE routers include an in-chassis Linux container environment called **GuestShell**.
  - Technicians simply enable GuestShell and execute our 1-command installer from the `/setup` tab:
    ```bash
    guestshell enable
    guestshell run bash -c "curl -sSL http://<MONITOR_IP>:3001/api/v1/network-discovery/agent/install.sh | bash"
    ```
  - The agent periodically polls the router's interfaces and streams metrics back to Port 3001.
- **Roadmap Enhancement (Native CLI/NETCONF):**
  - Building a direct SSH / NETCONF driver in NestJS using RFC 6241 to push Cisco IOS-XE configuration blocks directly without requiring GuestShell.

### 3.2 MikroTik Routers (RouterOS v7)
- **Current Operational Mode:** **RouterOS Container Mode (Live)**
  - MikroTik RouterOS v7 natively supports OCI containers.
  - The IntelliLink Edge Agent image runs directly on the MikroTik router, exposing telemetry via REST back to the central platform.
- **Roadmap Enhancement (RouterOS API / REST API):**
  - Direct integration with RouterOS REST API (`/rest/interface`, `/rest/ip/route`) for agentless provisioning.

### 3.3 Firewalls & Sovereign PoP Aggregators
- **Current Operational Mode:** **Native WireGuard & Linux Kernel (Live)**
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

## 5. Development Roadmap to 100% Completion

To bring the entire diagram from **85%** to **100% completed functionality**, the following three modular extensions are scheduled:

1. **SNMPv2c/SNMPv3 MIB Collector Daemon (Monitoring Engine):**
   - Implement a background UDP 161 worker service in NestJS to poll standard MIB-II (`1.3.6.1.2.1`) interface tables from legacy switches that cannot run edge containers.
2. **RFC 5424 Syslog Ingest Server (Monitoring Engine):**
   - Bind a high-performance UDP/TCP 514 syslog listener to parse incoming syslog events into the **Alerts** (`/alerts`) and **Incidents** (`/incidents`) pipeline.
3. **Native NETCONF / SSH Vendor Drivers (Automation Engine):**
   - Add native SSH client automation with vendor-specific templates (Cisco IOS-XE, Juniper Junos, Huawei VRP) to push configuration changes directly from the **Automation** (`/automation`) tab.

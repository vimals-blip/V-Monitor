# Intellilink Network Operations & Governance (NOG) Platform
## Architecture & Detailed System Design Specification

> **Document Version:** 2.4.0-ENTERPRISE  
> **Target Audience:** Principal Systems Architects, Lead DevOps/SRE Engineers, Core Backend Engineers, and Security Compliance Officers.  
> **Platform Scope:** Intellilink Carrier-Grade SD-WAN Control Plane & Autonomous NOC Architecture.

---

## 1. Architectural Philosophy: Strict Control / Data Plane Separation

Intellilink enforces strict architectural decoupling between the **Control Plane** (central orchestration, governance, policy distribution, telemetry collection, AI diagnostics) and the **Data / Forwarding Plane** (physical packet switching, WireGuard encryption, kernel routing, and firewall filtering).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CONTROL PLANE (BRAIN)                                  │
│                                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────┐   ┌───────────────────────┐  │
│  │   Next.js 14 Web NOC  │   │  NestJS REST/WS Backend  │   │   Python AIOps Engine │  │
│  │     (Port 3000)       │◄─►│       (Port 3001)        │◄─►│      (Port 8100)      │  │
│  └───────────────────────┘   └────────────┬─────────────┘   └───────────────────────┘  │
│                                           │ TypeORM / SQL                              │
│                                           ▼                                            │
│                              ┌──────────────────────────┐                              │
│                              │  MySQL 8.0 Relational &  │                              │
│                              │  Time-Series Repository  │                              │
│                              └──────────────────────────┘                              │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ mTLS / WebSocket / WireGuard Config (UDP 51820)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FORWARDING / DATA PLANE (MUSCLE)                          │
│                                                                                        │
│  ┌──────────────────────────┐    WireGuard SD-WAN Overlay    ┌──────────────────────┐  │
│  │   Edge CPE Gateways      │◄──────────────────────────────►│    Core PoP Hubs     │  │
│  │ (Starlink / Fiber / 5G)  │   (ChaCha20-Poly1305, x25519)  │ (Aggregators / BGP)  │  │
│  └────────────┬─────────────┘                                └──────────┬───────────┘  │
│               │                                                         │              │
│               ▼                                                         ▼              │
│      [ Linux Kernel FIB ]                                      [ Carrier Transit IXP ] │
│      [ Netfilter / nftables ]                                  [ Domestic AFRINIC IP ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Tenets:
1. **Autonomous Survivability:** If the central control plane becomes temporarily unreachable or offline, **zero user traffic is interrupted**. All edge gateways maintain their local kernel Forwarding Information Base (FIB) and active WireGuard sessions.
2. **Zero Synthetic Emulation:** Every metric, latency millisecond, packet counter, and neighbor MAC originates from genuine Linux kernel subsystems (`/sys/class/net`, `/proc/net/arp`, ICMP socket probes).
3. **Cryptographic Zero-Trust:** All branch-to-PoP and branch-to-branch data packets are encrypted in-flight using modern x25519 elliptic-curve keypairs and ChaCha20-Poly1305 authentication.

---

## 2. Microservices & Component Architecture

### 2.1 Web Presentation Tier (`apps/web` @ Port 3000)
- **Framework:** Next.js 14 App Router (React 18, TypeScript).
- **Styling & Theming:** Tailwind CSS v3 with dual-theme enterprise support (High-Contrast NOC Dark Mode `#0B0F17` and Executive Clean White Mode).
- **State Management & Caching:** `@tanstack/react-query` with configurable stale times (`5000ms`), optimistic mutations, and automated cache invalidation.
- **Dynamic Connection Binding:** Resolves API and WebSocket URLs dynamically via `window.location.hostname`, ensuring remote client browsers connect to port 3001 without requiring hardcoded localhost bindings.
- **Enterprise Pagination Engine:** Dedicated, reusable `<Pagination />` component providing server-side pagination (`pageSize: [10, 20, 50, 100]`), item counters, and ellipsis navigation across all 17 platform data tables.

### 2.2 Backend Control-Plane Tier (`apps/api` @ Port 3001)
- **Framework:** NestJS 10 (Node.js runtime, TypeScript, modular microservice architecture).
- **Database Access:** TypeORM 0.3 with raw SQL fallback for high-throughput batch operations.
- **Security & RBAC:**
  - `JwtAuthGuard`: Validates cryptographically signed JWT bearer tokens.
  - `RolesGuard`: Enforces 4 standardized enterprise operational roles (`PROVIDER_ADMIN`, `TENANT_ADMIN`, `NETOPS_ENGINEER`, `READONLY_AUDITOR`).
  - `TenantGuard`: Enforces strict multi-tenant isolation, preventing cross-tenant data leaks.
- **Telemetry & Hardware Discovery Engine (`NetworkDiscoveryService`):**
  - Scans `/proc/net/arp` and `/usr/bin/ip -j neigh` on physical interfaces (`eno1`).
  - Resolves hardware vendors against an embedded IEEE OUI database.
  - Employs concurrent, batch-probed ICMP echo sweeps (`ping -c 1 -W 0.25`) to measure true physical link RTT.
  - Asynchronously pushes updates to the frontend using Socket.IO (`/telemetry/socket`).

### 2.3 AIOps Diagnostic Engine (`apps/ai` @ Port 8100)
- **Framework:** Python 3.10+ with FastAPI, Uvicorn ASGI server, Pydantic data schemas.
- **Root Cause Analysis (RCA) Pipeline:**
  - Ingests telemetry time-series metrics from MySQL (`metric_samples`).
  - Computes statistical deviations ($z > 2.0\sigma$) over rolling 15-minute sliding windows.
  - Correlates link packet loss, BFD jitter, interface errors, and gateway heartbeat drops.
  - Emits structured RCA diagnostic cards containing `[FACT]`, `[INFERENCE]`, and prescriptive `[RECOMMENDATION]` runbooks.
- **Conversational NOC Copilot:** Natural-language interface equipped with read-only tools to interrogate the live network database, run live socket diagnostics, and draft incident summaries.

---

## 3. Relational & Time-Series Data Modeling (MySQL 8.0)

The relational schema is engineered with strict foreign key constraints, microsecond temporal tracking, and JSON document columns for flexible metric storage:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  organizations  │1     N│     tenants     │1     N│      sites      │
│  - id (UUID)    ├──────►│  - id (UUID)    ├──────►│  - id (UUID)    │
│  - name, slug   │       │  - orgId, name  │       │  - tenantId     │
└─────────────────┘       └─────────────────┘       │  - subnetCidr   │
                                                    └────────┬────────┘
                                                             │1
                                                             ▼N
┌─────────────────┐1     N┌─────────────────┐1     N┌─────────────────┐
│     routes      │◄──────┤    gateways     ├──────►│    wan_links    │
│  - prefix, next │       │  - id, hostname │       │  - type, CIR/PIR│
│  - protocol     │       │  - serialNumber │       │  - isPrimary    │
└─────────────────┘       └────────┬────────┘       └────────┬────────┘
                                   │1                        │1
                                   ▼N                        ▼N
                          ┌─────────────────┐       ┌─────────────────┐
                          │     tunnels     │       │ metric_samples  │
                          │  - localSubnet  │       │  - metrics JSON │
                          │  - remoteSubnet │       │  - timestamp    │
                          └─────────────────┘       └─────────────────┘
```

### Core Entities:
- **`organizations`**: Global partition representing the service provider or enterprise conglomerate.
- **`tenants`**: Customer or subsidiary partition with assigned quotas (`maxSites`, `maxGateways`).
- **`sites`**: Physical branch locations containing geographic latitude/longitude and local subnet scopes.
- **`gateways`**: Enrolled physical or virtual edge routers (`IntelliEdge-X800`, Linux CPEs, Cisco/MikroTik boxes).
- **`wan_links`**: Circuits terminating on a gateway (`FIBER`, `SATELLITE`, `CELLULAR_5G`, `BROADBAND`).
- **`tunnels`**: WireGuard overlays binding edge gateways to Regional PoP Aggregators.
- **`metric_samples`**: Time-series telemetry records storing latency, jitter, packet loss, and throughput counters.
- **`audit_logs`**: Immutable, append-only security log for SOC-2 Type II and ISO 27001 regulatory compliance.

---

## 4. Overlay Network Fabric (WireGuard & Routing Engine)

### 4.1 Zero-Trust Tunnel Configuration
Every edge-to-PoP tunnel is instantiated using standardized WireGuard interfaces (`wg0`):
- **Cipher Suite:** ChaCha20 for symmetric encryption, Poly1305 for authentication, Curve25519 for Diffie-Hellman key exchange, BLAKE2s for hashing.
- **MTU Optimization:** Enforced at `1420` bytes to prevent IP packet fragmentation across standard 1500-byte WAN MTU links (accounting for 60-byte WireGuard/IPv4 overhead).
- **Persistent Keepalive:** Set to `25` seconds to maintain bi-directional NAT state across Starlink CGNAT and cellular carrier firewalls.

### 4.2 Dynamic Traffic Steering & BFD Health Probing
- Bidirectional Forwarding Detection (BFD) probes are dispatched across each underlay link at **250ms intervals**.
- If 3 consecutive probes are unacknowledged (750ms total threshold), the link is marked `DEGRADED`.
- The local routing daemon updates the kernel Forwarding Information Base (FIB), seamlessly rerouting traffic across backup Starlink or 5G links without dropping active TCP connections.

---

## 5. Security Architecture & Threat Defense

1. **Defense-in-Depth Layering:**
   - **Boundary:** Stateful Linux netfilter/iptables/nftables packet filtering.
   - **Transit:** Pure WireGuard ChaCha20-Poly1305 encryption on all inter-site flows.
   - **Application:** NestJS Helmet headers, strict CORS validation, input sanitization via class-validator.
2. **Immutable Audit Verification:**
   - Every administrative mutation (`CREATE_FIREWALL_RULE`, `ROTATE_KEYS`, `FAILOVER_CIRCUIT`) generates an immutable database record containing the actor's ID, email, role, source IP, and timestamp.
   - Audit records are cryptographically timestamped and write-protected.
3. **Cryptographic Key Lifecycle:**
   - x25519 keypairs can be rotated on-demand from the UI or scheduled via automation playbooks, enforcing zero-trust forward secrecy.

---

*Intellilink Network Operations & Governance &copy; 2026. All rights reserved. Confidential enterprise documentation.*

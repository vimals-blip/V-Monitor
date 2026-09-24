# INTELLILINK PLATFORM — Client Operational Guide & Runbook

This guide covers daily operations, telemetry analysis, automation enforcement, diagnostic probing, and AIOps troubleshooting for the Intellilink Network Operations and Governance (NOG) platform.

---

## 1. Quick Access & Credentials

| Service | Protocol / Port | URL / Host | Notes |
|---|---|---|---|
| **NOC Web Dashboard** | HTTP `3000` | `http://localhost:3000` | Next.js 14 Production Build |
| **Control-Plane API** | HTTP `3001` | `http://localhost:3001/api/v1` | NestJS REST API + TypeORM |
| **AIOps Engine** | HTTP `8100` | `http://localhost:8100` | FastAPI Microservice |
| **MySQL Database** | TCP `3306` | `127.0.0.1:3306` | Database: `intellilink_db` |
| **Default NOC Admin** | — | `admin@intellilink.com` | Password: `IntelliLink@2026` |
| **Auditor Role** | — | `auditor@intellilink.com` | Password: `IntelliLink@2026` |
| **NOC Operator** | — | `operator@intellilink.com` | Password: `IntelliLink@2026` |

---

## 2. Platform Subsystems & Navigation

### 1. Multi-Tenant Infrastructure
* [`/tenants`](http://localhost:3000/tenants): Provision and manage multi-tenant enterprise accounts with isolated VRF domains, bandwidth quotas, and role-based access.
* [`/sites`](http://localhost:3000/sites): Geographic branch locations with GPS coordinates, city/state metadata, and assigned ICG Agent CPEs.
* [`/gateways`](http://localhost:3000/gateways): Managed edge routers (`gw-*.edge`), serial numbers, firmware versions, public keys, and heartbeat timers.

### 2. WAN & Transport Underlays
* [`/wan-links`](http://localhost:3000/wan-links): Multi-circuit underlays (Terrestrial Fiber, Starlink LEO Satellite, 5G Cellular).
  * **Real Kernel Benchmarking:** Click *Benchmark Speed & Latency* to trigger real Linux ICMP socket packets (`ping -c 3 -W 1`) against carrier transit (`8.8.8.8`) or local loopback (`127.0.0.1`). Unattached edge routers report authentic `OFFLINE_UNREACHABLE` states with 100% loss.

### 3. Core PoPs & WireGuard Overlays
* [`/pops`](http://localhost:3000/pops): Domestic Point of Presence backbone clusters. Click *Probe PoP Transit* to test core transit latency, BGP peering session status, and FIB entry state.
* [`/aggregators`](http://localhost:3000/aggregators): High-capacity WireGuard tunnel terminators. Click *Probe Host Aggregator* to check kernel module (`wireguard.ko`), live CPU load avg, and active peer counts.
* [`/tunnels`](http://localhost:3000/tunnels): Point-to-point encrypted overlays between edge gateways and core aggregators. Click *Verify Tunnel* to check ChaCha20-Poly1305 handshakes and peer reachability.

### 4. Routing & Security Policies
* [`/routing`](http://localhost:3000/routing): Linux Forwarding Information Base (FIB) route inspection via `/usr/sbin/ip route get`.
* [`/firewall`](http://localhost:3000/firewall): Stateful packet filter rules. Click *Simulate Match* to evaluate synthetic packets against active rules.
* [`/nat`](http://localhost:3000/nat): Sovereign address translation mapping satellite underlay addresses to domestic AFRINIC IP blocks (`41.x.x.x/16`).
* [`/policies`](http://localhost:3000/policies): Traffic steering policies. Click *Deploy & Enforce* to broadcast cryptographically signed (SHA-256) policy revisions to all active edge routers.

### 5. Automation & Incident Orchestration
* [`/automation`](http://localhost:3000/automation): Cisco-grade event-driven automation rules (SLA Path Steering, ZTP, Flap Damping, Threat Isolation). Click *Trigger Now* to run real-time ANSI terminal execution workflows.
* [`/alerts`](http://localhost:3000/alerts): Live alarm console with severity filtering (Critical, High, Warning, Info) and state transitions (Acknowledge, Resolve).
* [`/incidents`](http://localhost:3000/incidents): ITIL Incident Management with live **AIOps Root Cause Analysis (RCA)**. Open any incident and click *AI RCA & Manage* to calculate confidence scores, diagnose root causes, and view prescriptive remediations.
* [`/monitoring`](http://localhost:3000/monitoring): Real-time streaming metrics backed by 85,000+ MySQL samples, host OS kernel metrics, and the **AIOps Statistical Baseline & Anomaly Engine** ($z > 2.0\sigma$).
* [`/ai-assistant`](http://localhost:3000/ai-assistant): Conversational NOC assistant executing live tool calls against the database and Linux socket diagnostics.

---

## 3. Key API Endpoints Reference

All API requests must include the header: `Authorization: Bearer <TOKEN>`

### 1. Authentication
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@intellilink.com",
  "password": "IntelliLink@2026"
}
```

### 2. Live Kernel WAN Link Benchmark
```bash
POST /api/v1/wan-links/:id/benchmark
Content-Type: application/json

{
  "targetMode": "INTERNET_BACKBONE"  # Options: GATEWAY_CPE, INTERNET_BACKBONE, LOCAL_LOOPBACK
}
```

### 3. AIOps Conversational Query
```bash
POST /api/v1/ai/chat
Content-Type: application/json

{
  "message": "Which gateways are degraded right now and why?"
}
```

### 4. Automated Root Cause Analysis (RCA)
```bash
POST /api/v1/ai/rca
Content-Type: application/json

{
  "targetId": "<INCIDENT_OR_GATEWAY_ID>",
  "targetType": "INCIDENT"
}
```

### 5. Statistical Telemetry Anomaly Detection
```bash
POST /api/v1/ai/anomaly/detect
Content-Type: application/json

{
  "metricKey": "latencyMs",
  "threshold": 2.0,
  "sampleSize": 100
}
```

### 6. Event-Driven Automation Trigger
```bash
POST /api/v1/automation/:id/trigger
```

---

## 4. Service Management & Troubleshooting

### Restarting the Services
```bash
# 1. Kill existing processes on active ports
fuser -k 3001/tcp 3000/tcp 8100/tcp || true

# 2. Start NestJS Control-Plane API (Port 3001)
cd /home/cis/Desktop/V-Monitor/intellilink-platform/apps/api
node node_modules/.bin/ts-node src/main.ts &

# 3. Start Next.js Web Frontend (Port 3000)
cd /home/cis/Desktop/V-Monitor/intellilink-platform/apps/web
npm run start &

# 4. Start Python FastAPI AI Engine (Port 8100)
cd /home/cis/Desktop/V-Monitor/intellilink-platform/apps/ai-service
python3 main.py &
```

### Verifying Service Health
```bash
# API Health
curl -s http://localhost:3001/api/v1/system-health

# Web Frontend
curl -s -I http://localhost:3000/dashboard

# Python AI Engine
curl -s http://localhost:8100/health
```

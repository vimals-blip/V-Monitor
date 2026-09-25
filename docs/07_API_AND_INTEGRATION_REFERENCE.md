# Intellilink Network Operations & Governance (NOG) Platform
## REST API & External Integration Reference Manual

> **Document Version:** 2.4.0-ENTERPRISE  
> **API Version:** `v1`  
> **Target Audience:** Integration Engineers, NetDevOps Developers, Frontend Engineers, and Third-Party System Integrators.  
> **Base Protocol:** HTTP/1.1 & HTTP/2 with JSON payloads, mTLS WebSockets, and Swagger OpenAPI 3.0.

---

## 1. Global API Conventions & Dynamic Host Resolution

### 1.1 Base URL
All API requests are served under the global prefix `/api/v1`:
```
http://<SERVER_HOST>:3001/api/v1
```
* **Interactive Swagger UI:** Accessible directly at `http://<SERVER_HOST>:3001/api/docs`.
* **Dynamic Resolution:** In the web console, `apps/web/src/lib/api.ts` resolves `<SERVER_HOST>` automatically using `window.location.hostname`. Whether accessing from `localhost`, a LAN IP (`192.168.2.212`), or an enterprise DNS domain, all requests route to port 3001 on the serving host.

### 1.2 Authentication & Authorization
All endpoints (except `/auth/login` and `/health`) require an HTTP Bearer Token in the `Authorization` header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Tokens are cryptographically signed using HS256/RS256 and encode user identity, role, organization ID, and tenant ID.

---

## 2. Authentication & Identity Endpoints

### 2.1 Authenticate Operator (`POST /auth/login`)
Authenticates an enterprise administrator or network engineer and returns session tokens:

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@intellilink.com",
  "password": "IntelliLink@2026"
}
```

#### Response (`200 OK`):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "refreshToken": "eyJhbGciOiJIUzI1Ni...",
  "expiresIn": 86400,
  "user": {
    "id": "c1f7b8a2-3e4d-4f5a-b6c7-8d9e0f1a2b3c",
    "email": "admin@intellilink.com",
    "firstName": "Intellilink",
    "lastName": "Administrator",
    "role": "PROVIDER_ADMIN",
    "organizationId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "tenantId": "b1ffbc88-8b0a-3de7-aa5c-5aa8ac270b22"
  }
}
```

---

## 3. Physical Hardware Discovery & Enrollment

### 3.1 Sweep Physical Subnet (`POST /network-discovery/scan`)
Scans physical Linux network interfaces (`eno1`), kernel neighbor tables (`/proc/net/arp`), and performs concurrent ICMP/socket probes:

```http
POST /api/v1/network-discovery/scan
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "probePorts": true,
  "targetSubnet": "192.168.0.0/20"
}
```

#### Response (`200 OK`):
```json
{
  "scannedAt": "2026-09-25T13:20:00.000Z",
  "interface": "eno1",
  "hostIp": "192.168.2.212",
  "defaultGateway": "192.168.0.50",
  "subnetCidr": "192.168.0.0/20",
  "totalDiscovered": 89,
  "discoveredDevices": [
    {
      "ip": "192.168.0.50",
      "mac": "84:39:8f:1e:5a:12",
      "vendor": "Cisco Systems",
      "deviceType": "Core Gateway",
      "isDefaultGateway": true,
      "status": "ONLINE",
      "latencyMs": 0.16,
      "openPorts": [22, 80, 443, 161, 51820],
      "enrolled": true
    },
    {
      "ip": "192.168.0.120",
      "mac": "40:a8:f0:88:99:aa",
      "vendor": "Hewlett Packard Enterprise",
      "deviceType": "Enterprise Server",
      "isDefaultGateway": false,
      "status": "ONLINE",
      "latencyMs": 0.32,
      "openPorts": [22, 443],
      "enrolled": true
    }
  ]
}
```

### 3.2 Ingest Hardware Fleet (`POST /network-discovery/ingest`)
Enrolls selected physical hardware into MySQL without interrupting active operational data:

```http
POST /api/v1/network-discovery/ingest
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "deviceIps": ["192.168.0.50", "192.168.0.120", "192.168.1.45"]
}
```

---

## 4. Edge Gateway Control & Remote Operations

### 4.1 List Gateways with Pagination (`GET /gateways`)
Supports server-side pagination, search queries, and status filtering:

```http
GET /api/v1/gateways?page=1&pageSize=20&search=cisco
Authorization: Bearer <TOKEN>
```

#### Response (`200 OK`):
```json
{
  "data": [
    {
      "id": "e4b5c6d7-8e9f-0a1b-2c3d-4e5f6a7b8c9d",
      "hostname": "core-gw-192-168-0-50.lan",
      "serialNumber": "SN-84398F1E5A12",
      "model": "Cisco Systems Hardware (Core Gateway)",
      "firmwareVersion": "Enterprise v6.8-LTS",
      "status": "ONLINE",
      "lastHeartbeatAt": "2026-09-25T13:24:55.000Z",
      "site": {
        "id": "f5c6d7e8-9f0a-1b2c-3d4e-5f6a7b8c9d0e",
        "name": "Corporate HQ Campus (192.168.0.0/20)"
      }
    }
  ],
  "total": 89,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### 4.2 Execute Remote Diagnostic Action (`POST /gateways/:id/action`)
Dispatches live diagnostic commands to the physical edge gateway:

```http
POST /api/v1/gateways/e4b5c6d7-8e9f-0a1b-2c3d-4e5f6a7b8c9d/action
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "action": "PING",
  "target": "8.8.8.8"
}
```

#### Supported Actions:
- `PING`: Executes live kernel ICMP echo request, returning min/avg/max latency and packet loss.
- `AUTO_REMEDIATE`: Flushes interface ARP cache, tests ICMP, checks fallback circuits, and verifies FIB convergence.
- `FAILOVER_SATELLITE`: Steers branch outbound traffic over the Starlink LEO dish.
- `FLUSH_ARP`: Executes `ip neigh flush all dev eno1` to clear stale neighbor bindings.
- `ROTATE_KEYS`: Generates fresh Curve25519 session keys and updates WireGuard peer configuration.
- `RESTART_SERVICE`: Restarts node telemetry and networking daemons (`systemd-resolved`).

---

## 5. Multi-WAN Circuits & Live Benchmarking

### 5.1 Trigger WAN Link Benchmark (`POST /wan-links/:id/benchmark`)
Executes real-time packet loss, throughput, and jitter testing across a specific physical circuit:

```http
POST /api/v1/wan-links/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/benchmark
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "targetMode": "INTERNET_BACKBONE"
}
```

#### Response (`200 OK`):
```json
{
  "linkId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "targetMode": "INTERNET_BACKBONE",
  "targetAddress": "8.8.8.8",
  "connected": true,
  "latencyMs": 28.4,
  "packetLossPct": 0.0,
  "jitterMs": 1.2,
  "speedMbps": 218.5,
  "status": "EXCELLENT",
  "rawOutput": "PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=28.4 ms\n--- 8.8.8.8 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss"
}
```

---

## 6. Closed-Loop Automation Engine

### 6.1 Trigger Automation Workflow (`POST /automation/:id/trigger`)
Executes an automated self-healing playbook rule and returns step-by-step millisecond execution traces:

```http
POST /api/v1/automation/rule-bfd-failover-001/trigger
Authorization: Bearer <TOKEN>
Content-Type: application/json

{}
```

#### Response (`200 OK`):
```json
{
  "ruleId": "rule-bfd-failover-001",
  "ruleName": "Autonomous Multi-WAN Link Swap",
  "status": "COMPLETED",
  "result": {
    "executionTimeMs": 78,
    "steps": [
      { "step": 1, "name": "Verify Underlay Metric Degradation", "durationMs": 12, "detail": "Confirmed primary fiber link latency 72ms > threshold 60ms" },
      { "step": 2, "name": "Check Secondary Transport Reachability", "durationMs": 18, "detail": "Starlink LEO link verified reachable (28ms RTT, 0% loss)" },
      { "step": 3, "name": "Update Kernel Forwarding Information Base", "durationMs": 24, "detail": "ip route replace default via 10.100.1.1 dev wg0 metric 10" },
      { "step": 4, "name": "Flush Host ARP & Conntrack State", "durationMs": 14, "detail": "Interface eno1 neighbor cache flushed successfully" },
      { "step": 5, "name": "Commit State & Issue Audit Record", "durationMs": 10, "detail": "Wrote change record to audit_logs; notified NOC event bus" }
    ]
  }
}
```

---

## 7. Real-Time WebSocket Event Bus

The platform provides a bi-directional WebSocket interface on port `3001` using Socket.IO:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://<SERVER_HOST>:3001', {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
});

// Real-time telemetry stream (emitted every 5 seconds)
socket.on('network:live_telemetry', (data) => {
  console.log('Host throughput:', data.interface.statistics.rxBytes);
  console.log('Kernel RTT:', data.latencyMs);
});

// Alarm notifications
socket.on('alert:created', (alert) => {
  console.warn('CRITICAL ALARM:', alert.title, alert.severity);
});

// Automated playbook executions
socket.on('automation:executed', (run) => {
  console.log('Self-healing executed in', run.result.executionTimeMs, 'ms');
});
```

---

*Intellilink Network Operations & Governance &copy; 2026. All rights reserved. Confidential enterprise documentation.*

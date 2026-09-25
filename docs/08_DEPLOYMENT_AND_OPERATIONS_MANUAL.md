# IntelliLink OS: Deployment, Infrastructure & Operations Manual

---

## 1. System Requirements & Bare-Metal Specifications

IntelliLink OS is architected for bare-metal edge appliances, domestic telecom Point-of-Presence (PoP) servers, and enterprise datacenter deployments. To deliver microsecond-accurate telemetry and sub-second failover orchestration, host systems must comply with the specifications outlined below.

### 1.1 Hardware Specifications

| Profile | Target Capacity | CPU Cores | Memory | Disk Storage | Network Interfaces |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Edge Appliance** | 1–5 WANs, 100 LAN clients | 4 Cores (x86_64 / ARM64) | 8 GB DDR4 | 64 GB NVMe / SSD | 2x 1GbE (WAN/LAN) |
| **Regional Concentrator** | 50 Edge Nodes, 5 Gbps aggregate | 8 Cores (3.0 GHz+) | 16 GB DDR4/ECC | 256 GB NVMe SSD | 4x 1GbE / 2x 10GbE SFP+ |
| **Carrier NOC Master** | 1,000+ Nodes, 100k telemetry/sec | 16–32 Cores | 32–64 GB ECC | 1 TB Enterprise NVMe (RAID 10) | 2x 10GbE / 25GbE bonded |

### 1.2 Operating System & Kernel Dependencies
- **Base OS:** Ubuntu 22.04 LTS (Jammy Jellyfish) or Debian 12 (Bookworm) 64-bit.
- **Kernel:** Linux Kernel 5.15 LTS or later (with in-tree WireGuard, eBPF, and IP policy routing support).
- **Core Kernel Modules:**
  ```bash
  sudo modprobe wireguard
  sudo modprobe iptable_mangle
  sudo modprobe ip_tables
  sudo modprobe nf_conntrack
  ```
- **System Packages:**
  ```bash
  sudo apt update && sudo apt install -y \
    build-essential curl wget git jq fping \
    arp-scan net-tools iproute2 ethtool \
    wireguard wireguard-tools mysql-server \
    python3 python3-pip python3-venv \
    nodejs npm
  ```

---

## 2. Directory Structure & Environment Architecture

The platform is structured as an integrated monorepo workspace containing the frontend, backend microservices, and AI inference engines.

```
/home/cis/Desktop/V-Monitor/
├── apps/
│   ├── api/                     # NestJS 10 REST & WebSocket Core (Port 3001)
│   │   ├── src/
│   │   ├── dist/
│   │   ├── .env
│   │   └── package.json
│   └── web/                     # Next.js 14 Web NOC Interface (Port 3000)
│       ├── src/
│       ├── .next/
│       ├── .env.local
│       └── package.json
├── services/
│   └── ai-engine/               # FastAPI / Python 3.10 Inference Engine (Port 8100)
│       ├── main.py
│       ├── venv/
│       └── requirements.txt
├── docs/                        # Canonical Documentation Suite
└── intellilink-platform/        # Production Platform Distribution Mirror
```

---

## 3. Environment Variable Configuration

Each tier operates with dedicated environment files managing secrets, database sockets, and network bindings.

### 3.1 Backend API (`apps/api/.env`)
```bash
# Server Port & Binding
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# MySQL 8.0 High-Performance Connection
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=vmonitor_user
DB_PASSWORD=YourSecurePassword123!
DB_DATABASE=intellilink_db
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_CONNECTION_LIMIT=50

# Network Discovery & Kernel Sweeps
DISCOVERY_INTERFACE=eno1
DISCOVERY_SUBNET=192.168.0.0/20
DISCOVERY_PING_TIMEOUT_MS=250
DISCOVERY_CONCURRENCY=50

# AI Engine Hook
AI_ENGINE_URL=http://127.0.0.1:8100

# Security & Tokens
JWT_SECRET=super_secret_enterprise_jwt_signing_key_9941
CORS_ALLOWED_ORIGINS=*
```

### 3.2 Web Interface (`apps/web/.env.local`)
```bash
# Next.js Client-Side Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Dynamic Binding: When accessed externally, apps/web/src/lib/api.ts
# and apps/web/src/lib/websocket.ts automatically resolve window.location.hostname
# to route traffic directly to port 3001 on the serving host.
```

### 3.3 AI Inference Engine (`services/ai-engine/.env`)
```bash
PORT=8100
HOST=127.0.0.1
MODEL_PATH=./models/wan_anomaly_v2.onnx
CONFIDENCE_THRESHOLD=0.85
LOG_LEVEL=info
```

---

## 4. Production Service Orchestration (systemd)

For carrier-grade uptime, all processes run as managed `systemd` services with auto-restart, resource bounds, and journald logging.

### 4.1 NestJS Core Engine (`/etc/systemd/system/intellilink-api.service`)
```ini
[Unit]
Description=IntelliLink OS Core Telemetry & Orchestration Engine
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=cis
WorkingDirectory=/home/cis/Desktop/V-Monitor/apps/api
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=5
LimitNOFILE=65536
Environment=NODE_ENV=production

# Security Hardening
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
```

### 4.2 Next.js Web NOC (`/etc/systemd/system/intellilink-web.service`)
```ini
[Unit]
Description=IntelliLink OS Next.js 14 Mission Control NOC
After=network.target intellilink-api.service
Wants=intellilink-api.service

[Service]
Type=simple
User=cis
WorkingDirectory=/home/cis/Desktop/V-Monitor/apps/web
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### 4.3 AI Inference Engine (`/etc/systemd/system/intellilink-ai.service`)
```ini
[Unit]
Description=IntelliLink OS AI Predictive Link Optimization Engine
After=network.target

[Service]
Type=simple
User=cis
WorkingDirectory=/home/cis/Desktop/V-Monitor/services/ai-engine
ExecStart=/home/cis/Desktop/V-Monitor/services/ai-engine/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8100 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 4.4 Service Activation & Status Validation
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now intellilink-api intellilink-web intellilink-ai

# Verify Status
sudo systemctl status intellilink-api intellilink-web intellilink-ai --no-pager
```

---

## 5. Health Checks & Verification Suite

Run this quick command matrix to confirm end-to-end functionality across all layers:

```bash
# 1. API Health Check
curl -s http://127.0.0.1:3001/api/v1/health | jq .

# 2. AI Engine Health Check
curl -s http://127.0.0.1:8100/health | jq .

# 3. Web NOC Frontend HTTP Response
curl -I http://127.0.0.1:3000

# 4. Live ARP / Device Discovery Count
curl -s http://127.0.0.1:3001/api/v1/network/devices | jq '.length'

# 5. MySQL Connection Test
mysql -u vmonitor_user -p -e "SELECT count(*) AS total_telemetry FROM intellilink_db.telemetry_records;"
```

---

## 6. Backup, Restoration & Disaster Recovery

### 6.1 Database Automated Backup Script (`/opt/intellilink/bin/backup-db.sh`)
```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/intellilink"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_FILE="${BACKUP_DIR}/intellilink_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Starting IntelliLink DB dump: ${TARGET_FILE}"
mysqldump -u vmonitor_user -p'YourSecurePassword123!' \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  intellilink_db | gzip > "${TARGET_FILE}"

# Retain 14 daily rolling snapshots
find "${BACKUP_DIR}" -name "intellilink_db_*.sql.gz" -mtime +14 -exec rm -f {} \;
echo "Backup completed successfully."
```

### 6.2 Restoration Procedure
```bash
# Decompress and restore into MySQL 8.0
gunzip < /var/backups/intellilink/intellilink_db_YYYYMMDD_HHMMSS.sql.gz | \
  mysql -u vmonitor_user -p intellilink_db
```

### 6.3 WireGuard Cryptographic Backup
Back up active private keys, public keys, and routing tables:
```bash
sudo tar -czvf /var/backups/intellilink/wireguard_config_$(date +%Y%m%d).tar.gz /etc/wireguard/
```

---

## 7. Operational Troubleshooting Runbook

### Issue 1: Web Interface Shows `login (failed) net::ERR_CONNECTION_REFUSED`
- **Root Cause:** Next.js is configured with a static `localhost:3001` or the browser is accessing the dashboard via an external IP (e.g., `http://192.168.1.100:3000`) while the API is listening on `127.0.0.1` or the frontend client script is attempting to call `127.0.0.1` from the remote machine.
- **Resolution:**
  1. Confirm `apps/web/src/lib/api.ts` dynamic resolution is present:
     ```typescript
     const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
     return `http://${host}:3001`;
     ```
  2. Verify API is bound to `0.0.0.0` (all interfaces):
     ```bash
     ss -tulpn | grep 3001
     # Should output: LISTEN 0.0.0.0:3001
     ```

### Issue 2: `full-live-bootstrap` Remains in Pending State
- **Root Cause:** Initial bootstrap requests trigger an unbounded ARP sweep or serial device DNS lookups across broad subnets (`/20` or `/16`), taking longer than HTTP client timeout (30s+).
- **Resolution:**
  1. Ensure ping timeouts are capped at `250ms`:
     ```bash
     fping -c 1 -t 250 <target_ip>
     ```
  2. Ingest devices with chunked bulk insertions (`chunk: 50`) to eliminate database row locking.
  3. Verify the background sweep runs asynchronously:
     ```bash
     tail -f /home/cis/Desktop/V-Monitor/apps/api/dist/main.log
     ```

### Issue 3: Starlink Dish Telemetry Returns `502 Bad Gateway`
- **Root Cause:** Starlink router is in bypass mode without a static kernel route to `192.168.100.1` on the dedicated WAN interface.
- **Resolution:**
  Add a static host route directing dish traffic through the physical Ethernet adapter connected to the Starlink power injector:
  ```bash
  sudo ip route add 192.168.100.1/32 dev eno1
  curl -s --connect-timeout 2 http://192.168.100.1/
  ```

### Issue 4: MySQL 8.0 `Too many connections`
- **Root Cause:** High-frequency telemetry polling threads creating unpooled connections.
- **Resolution:**
  Increase max connections in `/etc/mysql/mysql.conf.d/mysqld.cnf`:
  ```ini
  [mysqld]
  max_connections = 500
  innodb_buffer_pool_size = 2G
  innodb_log_file_size = 512M
  ```
  Restart service: `sudo systemctl restart mysql`.

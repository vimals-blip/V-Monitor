# Physical Network Deployment, Hardware Discovery & Live Ingestion Manual

This guide describes how the Intellilink SD-WAN platform interacts with **genuine physical enterprise networks**, auto-discovers live networking hardware (Cisco routers, HP servers, Hyper-V appliances, MikroTik nodes), eliminates synthetic demo data, and ingests real kernel-level network telemetry.

---

## 1. Network Topology & Interface Inspection

The host machine running the Intellilink control plane connects directly to the enterprise local area network via physical interface `eno1`:

- **Active Interface**: `eno1` (MTU 1500, Link Speed 1000 Mbps Full-Duplex)
- **Local Host IP**: `192.168.2.212/20` (Broadcast `192.168.15.255`)
- **Default Core Gateway**: `192.168.0.50` (Cisco Systems Core Switch/Router)
- **Subnet Scope**: `192.168.0.0/20` (4,094 address space)

```bash
# Verify host interface status & default route
ip -br addr show eno1
ip route show default
```

Output:
```text
eno1  UP  192.168.2.212/20 
default via 192.168.0.50 dev eno1 proto static metric 100
```

---

## 2. Automated Physical Equipment Discovery Engine

The platform includes a native kernel-assisted network discovery service (`NetworkDiscoveryService` at `/api/v1/network-discovery`):

1. **ARP Cache & Route Resolution**:
   - Reads `/proc/net/arp` directly from the Linux kernel to detect physical hardware MAC addresses and IP addresses communicating on `eno1`.
2. **IEEE OUI Hardware Fingerprinting**:
   - Resolves manufacturer hardware fingerprints from IEEE OUI prefixes (e.g., `84:39:8f` → Cisco Systems, `00:15:5d` → Microsoft Hyper-V, `40:a8:f0` → HP Enterprise / Aruba, `ec:b1:d7` → Intel Corporation, `00:a2:b5` → Super Micro Computer, `00:02:c9` → NVIDIA Mellanox).
3. **Live ICMP & Socket Probing**:
   - Executes real millisecond-precision ICMP echo probes (`/usr/bin/ping -c 1 -W 1 <ip>`) to measure genuine round-trip time latency (typically 0.15ms to 1.2ms).
   - Probes key management ports: Port 22 (SSH), Port 80 (HTTP), Port 443 (HTTPS), Port 161 (SNMP), Port 51820 (WireGuard).
4. **Physical Database Ingestion**:
   - Ingests discovered equipment into the MySQL `gateways`, `sites`, and `wan_links` tables.

### Testing Discovery via API
```bash
# 1. Login as Administrator
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intellilink.com","password":"IntelliLink@2026"}' | jq -r .accessToken)

# 2. Trigger Real Subnet Scan
curl -s -X POST http://localhost:3001/api/v1/network-discovery/scan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"probePorts": true}' | jq .
```

Discovered Equipment Summary:
- **Total Discovered**: 91 physical hardware devices
- **Total Online & Reachable**: 42 active devices
- **Core Gateway**: `192.168.0.50` (Cisco Systems, 0.16 ms RTT, Ports 22, 80, 443 open)
- **Virtualization & Hyper-V**: `192.168.7.105` (Microsoft Hyper-V Edge, 0.28 ms RTT)
- **Enterprise Storage & Servers**: `192.168.15.234` (Super Micro Computer Inc.), `192.168.11.11` (NVIDIA Mellanox)

---

## 3. Real Kernel Telemetry Poller (Zero Dummy Data)

The background random telemetry generator script has been **permanently disabled and replaced** with `LiveKernelNetworkPoller`:

- **Kernel Statistics Source**: `/sys/class/net/eno1/statistics/rx_bytes` and `/sys/class/net/eno1/statistics/tx_bytes`.
- **Interval**: 5,000 ms.
- **Latency**: Measured via real ICMP ping to gateway `192.168.0.50`.
- **CPU & Memory**: Measured from `/proc/loadavg` and `/proc/meminfo`.
- **Database Storage**: Saved into `metric_samples` table in MySQL (`sourceType='GATEWAY'`).
- **WebSocket Broadcast**: Emitted live on event `network:live_telemetry`.

Verify live incoming samples in MySQL:
```bash
mysql -u root -proot intellilink_db -e "
  SELECT id, sourceType, metrics, createdAt 
  FROM metric_samples 
  ORDER BY createdAt DESC LIMIT 5;
"
```

Sample output:
```text
{"cpuPercent":66.5,"memoryPercent":78.8,"latencyMs":0.146,"trafficInKbps":306.32,"trafficOutKbps":2286}
```

---

## 4. One-Line Physical Edge Router Agent (`install.sh`)

Any physical edge router or server can be enrolled into the platform with a single command:

```bash
curl -sSL http://192.168.2.212:3001/api/v1/network-discovery/agent/install.sh | bash
```

### Supported Hardware & Operating Systems:
1. **Ubuntu / Debian / RHEL / CentOS Linux Server**:
   - The installer installs `/usr/local/bin/intellilink-agent` and creates a systemd service `intellilink-agent.service` that starts on boot.
2. **Cisco IOS-XE Routers (Catalyst 8000, ISR 4000, ASR 1000)**:
   - Launch IOx GuestShell and execute the curl command:
     ```text
     Router# guestshell run bash
     [guestshell@router]$ curl -sSL http://192.168.2.212:3001/api/v1/network-discovery/agent/install.sh | bash
     ```
3. **MikroTik RouterOS v7**:
   - Run the agent inside a RouterOS Docker container, or schedule the fetch script:
     ```text
     /tool fetch url="http://192.168.2.212:3001/api/v1/network-discovery/agent/install.sh" dst-path=agent.sh
     /system script run agent.sh
     ```
4. **OpenWrt Edge Appliances**:
   - Open SSH shell and execute the curl command.

---

## 5. Web UI Operations Guide

### 1. View Discovered Equipment & Ingest:
1. Navigate to **Gateways** (`http://localhost:3000/gateways`).
2. Notice the green pulsating banner: **"Live Enterprise Network Connected"**.
3. Click the **"Discover & Ingest Real Equipment"** button.
4. The modal shows real detected equipment on `192.168.0.0/20` with MAC address, Vendor, RTT ping latency, and open ports.
5. Select devices and click **"Ingest Selected into Fleet"** to register them in MySQL.

### 2. Purge Synthetic Demo Seed Data:
1. On the **Gateways** page or **Settings** page, click **"Purge Mock Data"**.
2. This removes synthetic demo branches (`Apollo - Lucknow`, `MaxCare - Indore`, etc.) and keeps **only genuine physical network hardware**.

### 3. Verify Hardware Diagnostics:
1. Click the **Radio icon** on any enrolled gateway in the table to execute a **Live ICMP Ping** directly through the Linux kernel.
2. Click **Rotate Keys** to generate and inject fresh WireGuard x25519 cryptographic keys.
3. Click **Push Config** to validate and apply active `wg0.conf` configuration.

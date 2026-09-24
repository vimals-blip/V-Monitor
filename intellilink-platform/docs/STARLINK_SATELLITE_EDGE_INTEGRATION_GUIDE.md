# Intellilink Network Operations & Governance (NOG) Platform
## Enterprise Starlink LEO Satellite Integration & Rapid Site Deployment Guide

> **Document Version:** 2.4.0-ENTERPRISE  
> **Target Audience:** Enterprise Clients, Field Network Technicians, IT Directors, and Procurement Officers.  
> **Platform Scope:** Intellilink Enterprise SD-WAN & Autonomous NOC Fabric ([intellilink.media](https://www.intellilink.media))

---

## 1. Executive Summary: What "< 24-Hour Site Provisioning" Means

In traditional enterprise networking, opening a new retail branch, logistics warehouse, mining site, factory, or corporate office is notoriously slow:

| Parameter | Traditional Telecom Leased Lines / MPLS | Intellilink + Starlink LEO Satellite | Business Value |
| :--- | :--- | :--- | :--- |
| **Site Provisioning Lead Time** | **60 to 90 Days** (road digging, municipal permits, fiber trenching) | **< 24 Hours** (ship Starlink kit + plug into Intellilink Edge Box) | **Instant Business Expansion** |
| **Monthly Telecom Line Cost** | $1,500 – $4,500 / month per location | $150 – $450 / month (Starlink Business + local broadband) | **Up to 75% Cost Reduction** |
| **Public Static IPv4 Requirement** | Mandatory (costs extra $100+/mo) | **Not Required** (outbound encrypted SD-WAN mesh bypasses CGNAT) | **Zero ISP Red Tape** |
| **Geographic Availability** | Restricted to urban fiber corridors | **Worldwide** (remote, offshore, rural, maritime, desert, mountain) | **100% Global Coverage** |
| **Failover Capability** | Manual switchover (30–60 mins downtime) | **Sub-second Automated Failover (< 800ms)** to Fiber or 5G | **Zero Downtime Guarantee** |

---

## 2. End-to-End Architectural Flow

The diagram below illustrates how a physical Starlink satellite antenna on a client roof communicates through the Intellilink Edge Box to your central Web Portal:

```
                  [ 🛰️ STARLINK LEO SATELLITE CONSTELLATION IN SPACE ]
                                         ▲
                                         │ (Phased-Array Radio Frequency Beam)
                                         ▼
                     [ 📡 STARLINK DISH / ANTENNA (ON ROOF) ]
                                         │
                                         ▼ (Starlink High-Speed Cable)
                    [ 🔌 STARLINK POWER SUPPLY / POE ADAPTER ]
                                         │ (Set to 'Bypass Mode' - Ethernet Port)
                                         ▼ WAN-2 Port (DHCP: 100.x.x.x CGNAT)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BRANCH SITE: INTELLILINK EDGE GATEWAY                           │
│                     (x86 Mini-PC, Industrial Router, or Linux Server)                   │
│                                                                                        │
│  1. Receives raw high-speed internet from Starlink Dish via DHCP                       │
│  2. Direct Starlink Management: Queries Dish Telemetry at `192.168.100.1`              │
│  3. BFD Health Prober: Measures latency (25-45ms) and satellite handoff jitter         │
│  4. Outbound WireGuard Tunnel (UDP 51820): Bypasses Starlink Carrier-Grade NAT (CGNAT) │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                                         │ Outbound Encrypted SD-WAN Mesh (ChaCha20-Poly1305)
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        INTELLILINK REGIONAL PoP / AGGREGATOR                           │
│                   (Data Center Gateway with Sovereign Public Static IP)                │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                                         │ Real-Time WebSocket & Secure REST Telemetry
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          INTELLILINK WEB NOC & GOVERNANCE PORTAL                       │
│                                                                                        │
│  • Sites Page (/sites): New branch appears instantly on World Map with GPS coordinates │
│  • WAN Links (/wan-links): Starlink circuit live (220 Mbps Down / 25 Mbps Up)          │
│  • Live Monitoring (/monitoring): Real-time graph of Starlink jitter & satellite swaps │
│  • Automated Playbooks (/automation): Sub-second failover from Fiber -> Starlink       │
│  • Executive Reports (/reports): 99.95% Contractual SLA compliance certificates        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. How the Starlink Antenna Connects: Step-by-Step Technical Guide

### Step 1: Physical Starlink Dish Placement & Power
1. Unbox the Starlink Kit (Standard Actuated, High Performance, or Flat High Performance).
2. Mount the antenna on the roof, exterior wall, or mast with an unobstructed view of the sky (100° clearance cone).
3. Connect the proprietary cable from the dish to the Starlink Power Supply / Router.

### Step 2: Enable "Bypass Mode" on Starlink Router
By default, the Starlink router includes consumer Wi-Fi and NAT. For enterprise deployment:
1. Open the Starlink App on an administrator phone.
2. Navigate to **Settings &rarr; Advanced &rarr; Bypass Starlink Wi-Fi Router**.
3. Toggle **Enable Bypass Mode** and confirm.
4. *What this does:* The internal consumer router is turned off, and the Starlink dish hands the raw carrier IP (CGNAT `100.64.0.0/10` or dynamic public IPv4) straight out of the RJ45 Ethernet port.

### Step 3: Cable into the Intellilink Edge Box
1. Take a standard Cat6 Ethernet cable from the Starlink Ethernet Adapter (or PoE injector).
2. Plug it into the **WAN-2** Ethernet port (e.g., `eth1` or `eno2`) of the physical Intellilink Edge Gateway router.
3. Plug the branch's primary fiber/broadband connection into **WAN-1** (`eth0`), and local office computers/switches into the **LAN** port.

### Step 4: Solving the Starlink CGNAT Problem (Outbound Tunneling)
Starlink does not assign a static public IPv4 address to standard or business dishes. Instead, it uses **Carrier-Grade NAT (CGNAT)**:
* In traditional networking, a remote office without a static public IP cannot receive incoming VPN connections.
* **Intellilink's Solution:** The Intellilink Edge Gateway creates an **outbound tunnel** to the nearest Intellilink Regional PoP (Point of Presence) using high-performance **WireGuard (UDP port 51820)**.
* Because the connection starts from *inside* the Starlink network and travels *outward*, it easily traverses Starlink's CGNAT firewalls. Once the tunnel is established, it forms a bi-directional, private corporate IP (e.g., `10.100.1.15`) that corporate headquarters and cloud applications can reach securely.

### Step 5: Starlink Dish Diagnostics Interface (`192.168.100.1`)
Every Starlink antenna in the world runs a built-in diagnostic and telemetry gRPC server at IP address `192.168.100.1`:
1. On the Intellilink Edge Gateway, add a static management route:
   ```bash
   sudo ip route add 192.168.100.1/32 dev eth1
   ```
2. The **Intellilink Agent** communicates with this interface to automatically extract:
   - **Antenna Tilt Angle & Azimuth**
   - **Sky Obstruction Percentage** (detects tree branches or buildings blocking satellite line-of-sight)
   - **Satellite Constellation Handoffs** (tracks when the antenna switches from one LEO satellite to another every 15 seconds)
   - **Signal-to-Noise Ratio (SNR) & Thermal State**

---

## 4. Multi-WAN Hybrid Failover: Starlink + Fiber + 5G

Intellilink does not require you to choose between Fiber and Starlink. It **bonds them together into an intelligent hybrid circuit**:

```
[ Primary Circuit: Terrestrial Optical Fiber (1 Gbps) ] ────┐
                                                            ├─► [ INTELLILINK BFD PROBER ]
[ Secondary Circuit: SpaceX Starlink LEO (220 Mbps) ]  ─────┤   (Checks health every 250ms)
                                                            │
[ Tertiary Circuit: 5G / LTE Cellular Backup (50 Mbps) ] ───┘
```

### How the Automated Self-Healing Works:
1. **Normal Operation:** All high-bandwidth traffic (bulk file transfers, cloud backups) and office traffic route through primary optical fiber. Starlink sits in active-standby, streaming continuous health heartbeats.
2. **Fiber Severance Event (Roadwork / Construction / Power Outage):**
   - In traditional networks, the branch is completely dark for 4 to 8 hours until telecom technicians repair the fiber line.
   - In Intellilink, the **Autonomous BFD Engine** detects 3 consecutive missed packets (750 milliseconds).
   - The platform executes the playbook: `SWAP_CIRCUIT_PRIORITY (Fiber -> Starlink LEO)`.
   - All active corporate Zoom meetings, VoIP calls, and banking transactions seamlessly shift over to the Starlink satellite link in **less than 800 milliseconds**.
3. **Automatic Reversion:** When the fiber line is restored and stabilizes for 3 minutes, the platform safely shifts traffic back to fiber without operator intervention.

---

## 5. What the Client Sees on the Live Portal

Once the field technician plugs in the cable, here is what immediately appears on the client's screen:

| Portal Section | URL | Visual Display & Client Verification |
| :--- | :--- | :--- |
| **Interactive World Map** | `/network-map` | The new branch appears on the world map with a satellite dish icon, color-coded green (`ONLINE`), showing its active tunnel to the nearest PoP. |
| **Site Inventory** | `/sites` | Displays branch name, physical address, GPS coordinates, local subnet CIDR (`192.168.10.0/24`), and connected hardware serial numbers. |
| **WAN Link Cockpit** | `/wan-links` | Shows `Starlink-LEO-Backup` with live real-time bandwidth meters (Download: 220 Mbps, Upload: 25 Mbps) and round-trip ping (28–42 ms). |
| **Live Telemetry & Jitter** | `/monitoring` | Continuous time-series graph displaying kernel-level packet loss, jitter curves, and satellite handoff performance. |
| **Automated Playbook Trace** | `/automation` | Historical execution audit showing when the satellite link was verified, tested, and ready for instant sub-second failover. |
| **Executive SLA Report** | `/reports` | 1-Click downloadable compliance report certifying **99.95% network availability** for the site under corporate SLA contracts. |

---

## 6. Field Technician 10-Minute Deployment Checklist

Print or email this checklist to field technicians deploying Starlink at client branch sites:

```
[ ] 1. PHYSICAL MOUNTING
    - Dish mounted on roof or exterior wall with clear northern/southern sky exposure.
    - Cable routed into server rack or networking closet without tight 90-degree bends.

[ ] 2. POWER & BYPASS MODE
    - Starlink power adapter connected to uninterruptible power supply (UPS).
    - Open Starlink mobile app -> Settings -> Advanced -> Turn ON 'Bypass Mode'.

[ ] 3. ETHERNET CONNECTION
    - Cat6 Ethernet cable from Starlink adapter plugged into WAN-2 port of Intellilink Edge Box.
    - LAN port connected to office Core Switch or Wi-Fi Access Points.

[ ] 4. ONE-COMMAND EDGE ENROLLMENT
    - Log into the Edge Box terminal (or SSH) and execute:
      curl -sSL http://<YOUR_PORTAL_IP>:3001/api/v1/network-discovery/agent/install.sh | sudo bash
    - Confirm the service is active: `systemctl status intellilink-agent`

[ ] 5. PORTAL VERIFICATION
    - Log in to http://<YOUR_PORTAL_IP>:3000
    - Verify the site displays green 'ONLINE' status with active Starlink throughput on /wan-links.
    - Trigger a test ping from the portal to confirm 0% packet loss.
```

---

*Intellilink Network Operations & Governance &copy; 2026. All rights reserved. Confidential enterprise documentation.*

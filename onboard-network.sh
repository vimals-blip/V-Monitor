#!/usr/bin/env bash
# ==============================================================================
# V-Monitor / IntelliLink OS - Initial Setup & Network Onboarding Script
# ==============================================================================
set -euo pipefail

API_BASE="http://localhost:3001/api/v1"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}   🌐 V-Monitor - Initial Setup & Network Onboarding                ${NC}"
echo -e "${BLUE}=====================================================================${NC}"

# Check if API is running
if ! curl -s http://localhost:3001/health >/dev/null 2>&1; then
  echo -e "${RED}❌ Backend API is not running on port 3001!${NC}"
  echo "Please start the services first by running: ./start-all.sh"
  exit 1
fi

# 1. Authenticate as Admin
echo -n "🔑 [1/4] Authenticating with Control Plane... "
LOGIN_RESP=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@intellilink.com","password":"IntelliLink@2026"}')

TOKEN=$(echo "$LOGIN_RESP" | jq -r .accessToken 2>/dev/null || echo "")
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}FAILED!${NC} Response: $LOGIN_RESP"
  exit 1
fi
echo -e "${GREEN}SUCCESS${NC}"

# 2. Inspect Host Physical Interfaces
echo ""
echo -e "📡 [2/4] Inspecting Local Linux Network Interfaces..."
INTERFACES_RESP=$(curl -s "$API_BASE/network-discovery/interfaces" -H "Authorization: Bearer $TOKEN")
echo "$INTERFACES_RESP" | jq -r '.[] | "   -> Interface: " + .name + " | IP: " + (.ip // "N/A") + " | MAC: " + (.mac // "N/A") + " | Status: " + (.status // "UP")' 2>/dev/null || echo "   Interfaces detected."

# 3. Trigger ARP & Neighbor Table Discovery
echo ""
echo -e "🔍 [3/4] Running Live ARP & Neighbor Table Device Sweep..."
SCAN_RESP=$(curl -s -X POST "$API_BASE/network-discovery/scan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customIps":[],"probePorts":false}')

DISCOVERED_COUNT=$(echo "$SCAN_RESP" | jq -r '.discoveredDevices | length' 2>/dev/null || echo "0")
echo -e "   -> ${GREEN}Discovered $DISCOVERED_COUNT live physical device(s) on local subnet.${NC}"

# 4. Prompt / Run Full Live Bootstrap
echo ""
TENANT_NAME="${1:-Enterprise Multi-Orbit Production}"
echo -e "🚀 [4/4] Provisioning Zero-Touch Network for Tenant: ${YELLOW}'${TENANT_NAME}'${NC}..."

BOOTSTRAP_RESP=$(curl -s -X POST "$API_BASE/network-discovery/full-live-bootstrap" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"clientTenantName\":\"${TENANT_NAME}\",\"targetIps\":[]}")

BOOTSTRAP_SUCCESS=$(echo "$BOOTSTRAP_RESP" | jq -r .success 2>/dev/null || echo "false")
GW_COUNT=$(echo "$BOOTSTRAP_RESP" | jq -r .gatewaysCreated 2>/dev/null || echo "0")
SITES_COUNT=$(echo "$BOOTSTRAP_RESP" | jq -r .sitesCreated 2>/dev/null || echo "0")

if [ "$BOOTSTRAP_SUCCESS" = "true" ] || [ "$GW_COUNT" != "null" ]; then
  echo -e "   -> ${GREEN}✓ Zero-Touch Network Provisioning Complete!${NC}"
  echo -e "   -> Gateways Synchronized: ${GREEN}${GW_COUNT}${NC}"
  echo -e "   -> Sites Provisioned:     ${GREEN}${SITES_COUNT}${NC}"
else
  echo -e "   -> Note: ${BOOTSTRAP_RESP}"
fi

LAN_IP=$(ip -4 addr show dev eno1 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1 || echo "localhost")

echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}🎉 Network Onboarding Complete!${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "🖥️  Interactive Setup Wizard in Web UI:"
echo -e "   ${YELLOW}http://localhost:3000/setup${NC} (or http://${LAN_IP}:3000/setup)"
echo -e ""
echo -e "⚙️  Connect Any Remote Laptop / Server / Router to this Network:"
echo -e "   Run this command on the remote machine:"
echo -e "   ${GREEN}curl -s http://${LAN_IP}:3001/api/v1/network-discovery/agent/install.sh | sudo bash${NC}"
echo -e ""
echo -e "📊 View Live Topology & Traffic:"
echo -e "   • Dashboard:   http://localhost:3000"
echo -e "   • Network Map: http://localhost:3000/network-map"
echo -e "   • Gateways:    http://localhost:3000/gateways"
echo -e "${BLUE}=====================================================================${NC}"

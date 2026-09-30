#!/usr/bin/env bash
# ==============================================================================
# V-Monitor / IntelliLink OS - Service Status Checker
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}   📡 V-Monitor (IntelliLink OS) - Service Health & Status           ${NC}"
echo -e "${BLUE}=====================================================================${NC}"

# 1. MySQL Database
echo -n "1. MySQL Database (Port 3306) ... "
if systemctl is-active --quiet mysql; then
  echo -e "${GREEN}● RUNNING${NC} (Active)"
else
  echo -e "${RED}○ STOPPED${NC} (Run: sudo systemctl start mysql)"
fi

# 2. NestJS Core API
echo -n "2. Backend API Core (Port 3001) . "
API_RESP=$(curl -s --connect-timeout 2 http://localhost:3001/health 2>/dev/null || echo "")
if [[ "$API_RESP" == *"ok"* ]]; then
  echo -e "${GREEN}● RUNNING${NC} (http://localhost:3001/api/docs)"
else
  echo -e "${RED}○ STOPPED${NC}"
fi

# 3. Next.js Web NOC
echo -n "3. Web NOC Frontend (Port 3000) . "
WEB_RESP=$(curl -s -I --connect-timeout 2 http://localhost:3000 2>/dev/null | head -n 1 || echo "")
if [[ "$WEB_RESP" == *"200"* ]]; then
  echo -e "${GREEN}● RUNNING${NC} (http://localhost:3000)"
else
  echo -e "${RED}○ STOPPED${NC}"
fi

# 4. FastAPI AI Engine
echo -n "4. AI Inference Engine (Port 8100) "
AI_RESP=$(curl -s --connect-timeout 2 http://localhost:8100/health 2>/dev/null || echo "")
if [[ "$AI_RESP" == *"ok"* ]]; then
  echo -e "${GREEN}● RUNNING${NC} (http://localhost:8100/docs)"
else
  echo -e "${RED}○ STOPPED${NC}"
fi

# 5. Telemetry Simulator
echo -n "5. Edge Telemetry Simulator ..... "
SIM_PID=$(pgrep -f "apps/simulator" || true)
if [ -n "$SIM_PID" ]; then
  echo -e "${GREEN}● RUNNING${NC} (PID: $SIM_PID)"
else
  echo -e "${YELLOW}○ INACTIVE${NC} (Optional)"
fi

echo -e "${BLUE}---------------------------------------------------------------------${NC}"
echo "🌐 Local Access:   http://localhost:3000"
LAN_IP=$(ip -4 addr show dev eno1 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1 || echo "")
if [ -n "$LAN_IP" ]; then
  echo "📡 LAN Access:     http://${LAN_IP}:3000"
fi
echo "🔑 Login:          admin@intellilink.media / IntelliLink@2026"
echo -e "${BLUE}=====================================================================${NC}"

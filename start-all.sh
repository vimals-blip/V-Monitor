#!/usr/bin/env bash
# ==============================================================================
# V-Monitor / IntelliLink OS - Unified Service Launcher
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "${SCRIPT_DIR}/apps" ]; then
  PLATFORM_DIR="${SCRIPT_DIR}"
else
  PLATFORM_DIR="${SCRIPT_DIR}/intellilink-platform"
fi
LOGS_DIR="${PLATFORM_DIR}/logs"
mkdir -p "${LOGS_DIR}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}   🚀 Starting V-Monitor (IntelliLink OS) Services                   ${NC}"
echo -e "${BLUE}=====================================================================${NC}"

# 1. Verify MySQL
echo -n "Checking MySQL status ... "
if ! systemctl is-active --quiet mysql; then
  echo -e "${YELLOW}MySQL is not running. Attempting to start...${NC}"
  sudo systemctl start mysql || {
    echo -e "${RED}Failed to start MySQL. Please run: sudo systemctl start mysql${NC}"
    exit 1
  }
fi
echo -e "${GREEN}✓ MySQL is active.${NC}"

# 2. Check & Build Backend API if dist/main.js is missing
if [ ! -f "${PLATFORM_DIR}/apps/api/dist/main.js" ]; then
  echo "Compiling Backend API (TypeScript)..."
  (cd "${PLATFORM_DIR}" && npx tsc -p apps/api/tsconfig.json)
fi

# 3. Start Core API (Port 3001)
if lsof -ti :3001 >/dev/null 2>&1; then
  echo -e "${YELLOW}○ API is already running on port 3001.${NC}"
else
  echo -n "Starting Backend API Core (Port 3001) ... "
  (cd "${PLATFORM_DIR}/apps/api" && \
    setsid env DATABASE_TYPE=mysql DATABASE_HOST=127.0.0.1 DATABASE_PORT=3306 DATABASE_USER=root DATABASE_PASSWORD=root DATABASE_NAME=intellilink_db \
    node dist/main.js </dev/null > "${LOGS_DIR}/api.log" 2>&1 &)
  
  # Wait for API health check
  for i in {1..15}; do
    if curl -s http://localhost:3001/health >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  echo -e "${GREEN}✓ API is UP.${NC}"
fi

# 4. Start Next.js Web NOC (Port 3000)
if lsof -ti :3000 >/dev/null 2>&1; then
  echo -e "${YELLOW}○ Web NOC is already running on port 3000.${NC}"
else
  echo -n "Starting Web NOC Frontend (Port 3000) ... "
  (cd "${PLATFORM_DIR}/apps/web" && \
    setsid npm run start -- -p 3000 </dev/null > "${LOGS_DIR}/web.log" 2>&1 &)

  for i in {1..15}; do
    if curl -s -I http://localhost:3000 >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  echo -e "${GREEN}✓ Web NOC is UP.${NC}"
fi

# 5. Start AI Engine (Port 8100)
if lsof -ti :8100 >/dev/null 2>&1; then
  echo -e "${YELLOW}○ AI Engine is already running on port 8100.${NC}"
else
  echo -n "Starting AI Inference Engine (Port 8100) ... "
  (cd "${PLATFORM_DIR}/apps/ai-service" && \
    setsid python3 -m uvicorn main:app --port 8100 </dev/null > "${LOGS_DIR}/ai.log" 2>&1 &)

  for i in {1..10}; do
    if curl -s http://localhost:8100/health >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  echo -e "${GREEN}✓ AI Engine is UP.${NC}"
fi

# 6. Start Edge Simulator (Real-Time Telemetry Generator)
if pgrep -f "apps/simulator" >/dev/null 2>&1; then
  echo -e "${YELLOW}○ Simulator is already running.${NC}"
else
  echo -n "Starting Edge Telemetry Simulator ... "
  setsid node "${PLATFORM_DIR}/apps/simulator/dist/main.js" </dev/null > "${LOGS_DIR}/simulator.log" 2>&1 &
  echo -e "${GREEN}✓ Simulator is active.${NC}"
fi

LAN_IP=$(ip -4 addr show dev eno1 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1 || echo "localhost")

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}🎉 All V-Monitor Services Are Running Successfully!${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "🖥️  Web NOC Dashboard:   ${GREEN}http://localhost:3000${NC}"
echo -e "📡 LAN Access:          ${GREEN}http://${LAN_IP}:3000${NC}"
echo -e "📚 API Documentation:   http://localhost:3001/api/docs"
echo -e "🤖 AI Engine:           http://localhost:8100/health"
echo -e ""
echo -e "🔑 Admin Credentials:"
echo -e "   • Email:    ${YELLOW}admin@intellilink.media${NC}"
echo -e "   • Password: ${YELLOW}IntelliLink@2026${NC}"
echo -e ""
echo -e "📜 Service Logs:"
echo -e "   • API:       tail -f ${LOGS_DIR}/api.log"
echo -e "   • Web:       tail -f ${LOGS_DIR}/web.log"
echo -e "   • AI:        tail -f ${LOGS_DIR}/ai.log"
echo -e "   • Simulator: tail -f ${LOGS_DIR}/simulator.log"
echo -e ""
echo -e "⚙️  Management Commands:"
echo -e "   • Check Status:  ./status.sh"
echo -e "   • Stop Services: ./stop-all.sh"
echo -e "   • Network Setup: ./onboard-network.sh"
echo -e "${BLUE}=====================================================================${NC}"

#!/usr/bin/env bash
# ==============================================================================
# V-Monitor / IntelliLink OS - Stop All Services
# ==============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}   🛑 Stopping V-Monitor Services...                                 ${NC}"
echo -e "${BLUE}=====================================================================${NC}"

stop_port() {
  local port=$1
  local name=$2
  local pids=$(lsof -ti :$port 2>/dev/null || fuser $port/tcp 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "Stopping $name (Port $port, PID: $pids)..."
    kill -TERM $pids 2>/dev/null || kill -9 $pids 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✓ $name stopped.${NC}"
  else
    echo "○ $name (Port $port) is not running."
  fi
}

# Stop Web Frontend (Port 3000)
stop_port 3000 "Web NOC Frontend"

# Stop Core API (Port 3001)
stop_port 3001 "Backend API Core"

# Stop AI Service (Port 8100)
stop_port 8100 "AI Engine"

# Stop Simulator if running
SIM_PIDS=$(pgrep -f "apps/simulator" || true)
if [ -n "$SIM_PIDS" ]; then
  echo "Stopping Edge Telemetry Simulator (PID: $SIM_PIDS)..."
  kill -TERM $SIM_PIDS 2>/dev/null || true
  echo -e "${GREEN}✓ Simulator stopped.${NC}"
fi

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}✓ All V-Monitor application services stopped.${NC}"
echo -e "${BLUE}=====================================================================${NC}"

#!/bin/bash

GREEN='\033[1;32m'
RED='\033[1;31m'
PURPLE='\033[1;35m'
CYAN='\033[1;36m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}Kill process running on port.${NC}"

read -p "Enter the port you want to check: " PORT_NO

# Validate input
if ! [[ "$PORT_NO" =~ ^[0-9]+$ ]]; then
  echo -e "${RED}Invalid port number.${NC}"
  exit 1
fi

# Get PID using ss (more reliable)
PID=$(ss -lptn "sport = :$PORT_NO" 2>/dev/null | awk -F 'pid=' 'NR>1 {split($2,a,","); print a[1]}' | head -n 1)

if [ -z "$PID" ]; then
  echo -e "${PURPLE}No process is running on port $PORT_NO${NC}"
  exit 1
fi

echo -e "${BLUE}Process found with PID: $PID${NC}"

# Try graceful kill first
kill "$PID" 2>/dev/null

sleep 1

# Check if still running
if kill -0 "$PID" 2>/dev/null; then
  echo -e "${RED}Force killing process...${NC}"
  kill -9 "$PID"
fi

echo -e "${GREEN}Process on port $PORT_NO killed.${NC}"
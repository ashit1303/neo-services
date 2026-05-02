#!/bin/bash

GREEN='\033[1;32m'
RED='\033[1;31m'
PURPLE='\033[1;35m'
CYAN='\033[1;36m'
BLUE='\033[1;34m'
NC='\033[0m'

while read -r line; do
  if [[ $line =~ ^\[.*\]$ ]]; then
    SERVICE=${line//[\[\]]/}
  elif [[ $line =~ ^[0-9]+$ ]]; then
    PORT_NO=$line
    PID=$(ss -lptn "sport = :$PORT_NO" 2>/dev/null | grep LISTEN | cut -d "=" -f 2 | cut -d "," -f 1)

    if [[ -n $PID ]]; then
      echo -e "${CYAN}$SERVICE ($PORT_NO) → PID $PID${NC}"
      if kill -9 "$PID" 2>/dev/null; then
        echo -e "${GREEN}✔ Process killed${NC}"
      else
        echo -e "${PURPLE}✘ Failed to kill${NC}"
      fi
    else
      echo -e "${BLUE}$SERVICE ($PORT_NO) → No process found${NC}"
    fi
  fi
done < ports.ini

echo -e "${RED}Done${NC}"
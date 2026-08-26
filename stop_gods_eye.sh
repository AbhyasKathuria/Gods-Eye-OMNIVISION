#!/bin/bash

echo "======================================================"
echo "  GOD'S EYE -- SHUTTING DOWN"
echo "======================================================"
echo ""
echo " [*] Stopping all God's Eye servers..."
echo ""

# Find and kill processes
pkill -f uvicorn 2>/dev/null
pkill -f vite 2>/dev/null

echo " [+] Backend stopped"
echo " [+] Frontend stopped"
echo ""
echo " [+] God's Eye is now OFFLINE"
echo ""

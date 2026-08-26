#!/bin/bash

# Clear terminal screen
clear

echo "======================================================"
echo " GOD'S EYE  --  OMNIVISION INTELLIGENCE PLATFORM v1.0"
echo " Developed by Abhyas Kathuria"
echo "======================================================"
echo ""
echo " [*] Initializing God's Eye systems..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo " [!] ERROR: Node.js not found. Please install Node.js first."
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo " [!] ERROR: Python not found. Please install Python first."
    exit 1
fi

PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo " [+] Node.js detected"
echo " [+] Python detected ($PYTHON_CMD)"
echo " [+] Starting Backend API..."
echo ""

# Start Backend
cd backend || exit 1
if [ -d "venv" ]; then
    echo " [+] Virtual environment found"
    source venv/bin/activate
fi

# Run backend in the background and store PID
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo " [+] Backend starting on http://localhost:8000 (PID: $BACKEND_PID)"
cd ..

# Wait for backend
sleep 4

# Start Frontend
cd frontend || exit 1
echo " [+] Starting Frontend..."
npm run dev &
FRONTEND_PID=$!
echo " [+] Frontend starting on http://localhost:5173 (PID: $FRONTEND_PID)"
cd ..

# Wait for frontend
sleep 3

# Open browser depending on OS
echo " [+] Opening God's Eye in browser..."
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173"
elif command -v open &> /dev/null; then
    open "http://localhost:5173"
else
    echo " [!] Cannot open browser automatically. Please navigate to http://localhost:5173 manually."
fi

echo ""
echo " ======================================================"
echo "  GOD'S EYE IS NOW ONLINE"
echo ""
echo "  Backend  : http://localhost:8000"
echo "  Frontend : http://localhost:5173"
echo ""
echo "  Press CTRL+C to STOP all servers"
echo " ======================================================"
echo ""

# Keep script running and clean shutdown on exit (SIGINT/SIGTERM)
cleanup() {
    echo ""
    echo " [*] Shutting down God's Eye servers..."
    kill "$BACKEND_PID" 2>/dev/null
    kill "$FRONTEND_PID" 2>/dev/null
    # Kill any dangling processes
    pkill -f uvicorn 2>/dev/null
    pkill -f vite 2>/dev/null
    echo " [+] All systems offline."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait indefinitely
while true; do
    sleep 1
done

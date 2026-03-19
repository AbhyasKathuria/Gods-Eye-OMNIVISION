@echo off
title GOD'S EYE — OMNIVISION LAUNCHER
color 04
cls

REM === AUTO UNBLOCK SELF ===
powershell -Command "Unblock-File -Path '%~f0'" >nul 2>&1
powershell -Command "Unblock-File -Path '%~dp0STOP_GODS_EYE.bat'" >nul 2>&1

echo.
echo  ======================================================
echo   GOD'S EYE  --  OMNIVISION INTELLIGENCE PLATFORM v1.0
echo   Developed by Abhyas Kathuria
echo  ======================================================
echo.
echo  [*] Initializing God's Eye systems...
echo.

REM === CHECK NODE ===
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] ERROR: Node.js not found. Please install Node.js first.
    pause
    exit
)

REM === CHECK PYTHON ===
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] ERROR: Python not found. Please install Python first.
    pause
    exit
)

echo  [+] Node.js detected
echo  [+] Python detected
echo  [+] Starting Backend API...
echo.

REM === START BACKEND ===
cd /d "C:\Users\kathu\Desktop\projects\God's_Eye\backend"

if exist "venv\Scripts\activate.bat" (
    echo  [+] Virtual environment found
    start "GOD'S EYE BACKEND" cmd /k "color 04 && title GOD'S EYE BACKEND && venv\Scripts\activate && uvicorn main:app --reload --port 8000"
) else (
    start "GOD'S EYE BACKEND" cmd /k "color 04 && title GOD'S EYE BACKEND && uvicorn main:app --reload --port 8000"
)

echo  [+] Backend starting on http://localhost:8000
echo  [*] Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

REM === START FRONTEND ===
cd /d "C:\Users\kathu\Desktop\projects\God's_Eye\frontend"
echo  [+] Starting Frontend...
start "GOD'S EYE FRONTEND" cmd /k "color 04 && title GOD'S EYE FRONTEND && npm run dev"

echo  [+] Frontend starting on http://localhost:5173
echo  [*] Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul

REM === OPEN BROWSER ===
echo  [+] Opening God's Eye in browser...
start "" "http://localhost:5173"

echo.
echo  ======================================================
echo   GOD'S EYE IS NOW ONLINE
echo.
echo   Backend  : http://localhost:8000
echo   Frontend : http://localhost:5173
echo.
echo   Press any key to STOP all servers
echo  ======================================================
echo.
pause >nul

REM === SHUTDOWN ===
echo  [*] Shutting down God's Eye...
taskkill /fi "WindowTitle eq GOD'S EYE BACKEND*" /f >nul 2>&1
taskkill /fi "WindowTitle eq GOD'S EYE FRONTEND*" /f >nul 2>&1
taskkill /im uvicorn.exe /f >nul 2>&1
echo  [+] All systems offline.
timeout /t 2 /nobreak >nul
exit

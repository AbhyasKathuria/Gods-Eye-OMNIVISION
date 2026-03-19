@echo off
title GOD'S EYE — SHUTDOWN
color 04

REM === AUTO UNBLOCK SELF ===
powershell -Command "Unblock-File -Path '%~f0'" >nul 2>&1

cls
echo.
echo  ======================================================
echo   GOD'S EYE -- SHUTTING DOWN
echo  ======================================================
echo.
echo  [*] Stopping all God's Eye servers...
echo.
taskkill /fi "WindowTitle eq GOD'S EYE BACKEND*" /f >nul 2>&1
taskkill /fi "WindowTitle eq GOD'S EYE FRONTEND*" /f >nul 2>&1
taskkill /im uvicorn.exe /f >nul 2>&1
taskkill /im node.exe /f >nul 2>&1
echo  [+] Backend stopped
echo  [+] Frontend stopped
echo.
echo  [+] God's Eye is now OFFLINE
echo.
timeout /t 2 /nobreak >nul
exit

@echo off
REM POST-LAUNCH MONITORING
REM Run this after posting Tweet #1

echo ========================================
echo   GG LOOP - POST-LAUNCH MONITORING
echo ========================================
echo.

echo Starting automated monitoring...
echo.

:MONITOR_LOOP

REM Check engagement
echo [%TIME%] Checking engagement...
node scripts/run-operations.js

echo.
echo Next check in 2 hours...
echo Press Ctrl+C to stop monitoring
echo.

REM Wait 2 hours (7200 seconds)
timeout /t 7200 /nobreak

goto MONITOR_LOOP

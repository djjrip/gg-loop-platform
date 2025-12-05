@echo off
REM ═══════════════════════════════════════════════════════════════
REM EMPIRE MONITORING STACK - QUICK START
REM Start all monitoring services with one click
REM ═══════════════════════════════════════════════════════════════

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║      EMPIRE MONITORING STACK - STARTING SERVICES         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🐳 Starting Docker containers...
docker-compose up -d prometheus grafana loki promtail

echo.
echo ⏳ Waiting 10 seconds for services to start...
timeout /t 10 /nobreak > nul

echo.
echo 🔍 Running health check...
powershell -ExecutionPolicy Bypass -File "CHECK_MONITORING.ps1"

echo.
echo 🌐 Opening Grafana in browser...
start http://localhost:3030

echo.
echo ✅ Monitoring stack started!
echo.
pause

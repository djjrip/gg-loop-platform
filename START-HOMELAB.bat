@echo off
REM ═══════════════════════════════════════════════════════════════
REM GG LOOP EMPIRE - HOMELAB DEPLOYMENT
REM Start all services with one command
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo   GG LOOP EMPIRE - HOMELAB STARTUP
echo ═══════════════════════════════════════════════════════════════
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [✓] Docker is running
echo.

REM Check if .env.homelab exists
if not exist ".env.homelab" (
    echo [WARNING] .env.homelab not found!
    echo.
    echo Creating from template...
    copy .env.example .env.homelab
    echo.
    echo [ACTION REQUIRED] Please edit .env.homelab and add your API keys
    echo Then run this script again.
    pause
    exit /b 1
)

echo [✓] Environment file found
echo.

REM Pull latest images (optional)
echo [→] Pulling latest Docker images...
docker-compose -f docker-compose.homelab.yml pull
echo.

REM Start all services
echo [→] Starting GG Loop Empire services...
echo.
docker-compose -f docker-compose.homelab.yml up -d

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services!
    echo.
    echo Run this command to see logs:
    echo   docker-compose -f docker-compose.homelab.yml logs
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo   EMPIRE SERVICES STARTED
echo ═══════════════════════════════════════════════════════════════
echo.
echo   Services starting in background...
echo   Wait 60 seconds for full initialization.
echo.
echo   Access Points:
echo   ─────────────────────────────────────────────────────────────
echo   • GG Loop App:      http://localhost
echo   • Empire Hub:       http://localhost/hub
echo   • Grafana:          http://localhost/grafana
echo   • Prometheus:       http://localhost/prometheus
echo.
echo   Monitoring Commands:
echo   ─────────────────────────────────────────────────────────────
echo   • View all logs:    docker-compose -f docker-compose.homelab.yml logs -f
echo   • View status:      docker-compose -f docker-compose.homelab.yml ps
echo   • Stop services:    docker-compose -f docker-compose.homelab.yml down
echo.
echo   Health Checks:
echo   ─────────────────────────────────────────────────────────────
echo   • Main app:    http://localhost:3000/health
echo   • Bot health:  http://localhost:3001/health
echo   • Hub health:  http://localhost:8080/health
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

timeout /t 5
echo Opening Empire Hub dashboard...
start http://localhost:8080

pause

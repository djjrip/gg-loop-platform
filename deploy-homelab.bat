@echo off
REM ═══════════════════════════════════════════════════════════════
REM EMPIRE HOMELAB - ONE-COMMAND DEPLOY (Batch)
REM ═══════════════════════════════════════════════════════════════

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║       EMPIRE HOMELAB - DEPLOYMENT SCRIPT                 ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is available
echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Docker is not installed!
    echo.
    echo Please install Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo ✓ Docker is available

REM Check .env
echo.
echo [2/5] Checking environment configuration...
if not exist .env (
    echo ⚠ Creating .env from template...
    copy .env.homelab .env
    echo.
    echo IMPORTANT: Edit .env before continuing!
    notepad .env
    pause
)

REM Build and deploy
echo.
echo [3/5] Building images...
docker compose -f docker-compose.homelab.yml build

echo.
echo [4/5] Starting services...
docker compose -f docker-compose.homelab.yml up -d

echo.
echo [5/5] Checking status...
timeout /t 5 /nobreak >nul
docker compose -f docker-compose.homelab.yml ps

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║              DEPLOYMENT COMPLETE!                         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🌐 ACCESS URLS:
echo   Empire Frontend: http://localhost:8080
echo   Empire API:      http://localhost:3000
echo   Uptime Kuma:     http://localhost:3001
echo   Grafana:         http://localhost:3030
echo.
pause

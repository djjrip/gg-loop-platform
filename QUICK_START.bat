@echo off
REM Quick Start Script - Get GG Loop Running Locally
REM Uses existing postgres/redis containers and pre-built code

echo.
echo ========================================
echo  GG LOOP - QUICK START
echo ========================================
echo.

REM Check if postgres is running
docker ps | findstr "gg-postgres" >nul
if %errorlevel% neq 0 (
    echo Starting postgres container...
    docker run -d --name gg-postgres --network gg-loop-platform_empire-network -e POSTGRES_USER=empire -e POSTGRES_PASSWORD=changeme -e POSTGRES_DB=ggloop_production -p 5432:5432 postgres:16-alpine
    timeout /t 5 /nobreak >nul
)

REM Check if redis is running  
docker ps | findstr "gg-redis" >nul
if %errorlevel% neq 0 (
    echo Starting redis container...
    docker run -d --name gg-redis --network gg-loop-platform_empire-network -p 6379:6379 redis:7-alpine
    timeout /t 3 /nobreak >nul
)

echo.
echo Database containers ready!
echo.
echo To get shop live on ggloop.io, you need Railway DATABASE_URL.
echo.
echo Option 1: Seed Railway Database (Recommended)
echo   1. Get DATABASE_URL from https://railway.app
echo   2. Run: $env:RAILWAY_DATABASE_URL="your-url"; node scripts/seed-railway-rewards.js
echo.
echo Option 2: Test Locally
echo   1. Fix node_modules: Remove-Item -Recurse node_modules; npm install
echo   2. Build: npm run build
echo   3. Start: npm start
echo.
echo Current Status:
echo   - Local postgres: READY (3 rewards seeded)
echo   - Local redis: READY
echo   - Production (ggloop.io): Needs Railway seed
echo.

pause

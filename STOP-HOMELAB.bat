@echo off
REM ═══════════════════════════════════════════════════════════════
REM GG LOOP EMPIRE - HOMELAB SHUTDOWN
REM Stop all services gracefully
REM ═══════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════
echo   GG LOOP EMPIRE - HOMELAB SHUTDOWN
echo ═══════════════════════════════════════════════════════════════
echo.

echo [→] Stopping all Empire services...
echo.

docker-compose -f docker-compose.homelab.yml down

if errorlevel 1 (
    echo.
    echo [WARNING] Some services may still be running
    echo Try manually: docker-compose -f docker-compose.homelab.yml down -v
    pause
    exit /b 1
)

echo.
echo [✓] All services stopped
echo.
echo Data is preserved in Docker volumes.
echo To delete all data, run:
echo   docker-compose -f docker-compose.homelab.yml down -v
echo.

pause
